import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { defaultAutomationCliprVoiceId } from "./defaultAutomationCliprVoiceId";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

const AUTOMATION_CLIPR_ADD_MUSIC = false;
const AUTOMATION_CLIPR_DURATION_SECONDS = 30;

export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);

    const runId = `automation:clipr:${ownerId}:${automationDate}`;

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
      tool: "clipr",
      idempotencyKey: `${ownerId}:${automationDate}:clipr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("clipr")) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Clipr automation is disabled.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const selectedProductIds = new Set(preferences.selectedProductIds);
    const product =
      preferences.productSelectionMode === "selected"
        ? products.find((candidate) => selectedProductIds.has(candidate.id))
        : products[0];
    const avatars = await ctx.db
      .query("avatars")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const selectedAvatarIds = new Set(preferences.selectedAvatarIds);
    const avatar =
      preferences.avatarSelectionMode === "selected"
        ? avatars.find((candidate) => selectedAvatarIds.has(candidate.id))
        : avatars[0];
    const photos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const avatarPhoto = avatar
      ? photos.find(
          (photo) =>
            photo.avatarId === avatar.id &&
            photo.photoObject.contentType.startsWith("image/"),
        )
      : undefined;

    if (!product || !avatar || !avatarPhoto) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Clipr automation needs one product, one avatar, and one avatar photo.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool: "clipr",
      providerCostUnits: 30,
    });

    const voiceId = avatar.cliprVoiceId ?? defaultAutomationCliprVoiceId;
    const task = await createAutomationTask(ctx, {
      ownerId,
      id: `${runId}:1`,
      runId,
      tool: "clipr",
      taskType: "clipr-video",
      stage: "awaiting-script-provider",
      idempotencyKey: `${ownerId}:${automationDate}:clipr:1`,
      inputSnapshotJson: JSON.stringify({
        addMusic: AUTOMATION_CLIPR_ADD_MUSIC,
        automationDate,
        productId: product.id,
        productName: product.name,
        productDetails: product.productDetails,
        audienceDetails: product.audienceDetails,
        cliprPlaceholderFillers: product.cliprPlaceholderFillers,
        eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
        eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
        inferredProblem: product.inferredProblem,
        inferredPainPoints: product.inferredPainPoints,
        preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
        productCreatedAt: product.createdAt,
        productUpdatedAt: product.updatedAt,
        avatarId: avatar.id,
        avatarName: avatar.name,
        avatarDescription: avatar.description,
        avatarPhotoId: avatarPhoto.id,
        avatarPhotoObject: avatarPhoto.photoObject,
        voiceId,
        targetDurationSeconds: AUTOMATION_CLIPR_DURATION_SECONDS,
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
