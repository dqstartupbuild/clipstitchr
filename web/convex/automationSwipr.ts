import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);

    const runId = `automation:swipr:${ownerId}:${automationDate}`;

    if (!isWithinAutomationGlobalWindow(now)) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      automationDate,
      tool: "swipr",
      idempotencyKey: `${ownerId}:${automationDate}:swipr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    if (!getIsAutomationToolEnabled("swipr")) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swipr automation is disabled by the code flag.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("swipr")) {
      await markAutomationRunSkipped(ctx, run._id, "Swipr automation is disabled.", now);
      return { runId, status: "skipped", taskIds: [] };
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const selectedProductIds = new Set(preferences.selectedProductIds);
    const defaultProduct = await getDefaultProductForOwner(ctx, ownerId);
    const product =
      preferences.productSelectionMode === "selected"
        ? products.find((candidate) => selectedProductIds.has(candidate.id))
        : defaultProduct ?? products[0];
    const backgrounds = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_created")
      .order("desc")
      .collect();
    const background = backgrounds[0];

    if (!product || !background) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swipr automation needs one product and one saved background.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool: "swipr",
      providerCostUnits: 5,
    });

    const task = await createAutomationTask(ctx, {
      ownerId,
      id: `${runId}:1`,
      runId,
      tool: "swipr",
      taskType: "swipr-draft",
      stage: "awaiting-text-provider",
      idempotencyKey: `${ownerId}:${automationDate}:swipr:1`,
      inputSnapshotJson: JSON.stringify({
        automationDate,
        productId: product.id,
        productName: product.name,
        productDetails: product.productDetails,
        audienceDetails: product.audienceDetails,
        inferredProblem: product.inferredProblem,
        inferredPainPoints: product.inferredPainPoints,
        backgroundId: background.id,
      }),
      createdAt: now,
    });
    await ctx.db.patch(run._id, {
      status: "running",
      startedAt: now,
      updatedAt: now,
    });

    return { runId, status: "running", taskIds: [task.id] };
  },
});
