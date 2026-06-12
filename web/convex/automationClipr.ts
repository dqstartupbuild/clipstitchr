import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { defaultAutomationCliprVoiceId } from "./defaultAutomationCliprVoiceId";
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { defaultCliprDurationSeconds } from "../lib/clipstitchr/constants/defaultCliprDurationSeconds";
import { defaultCliprGenerationMode } from "../lib/clipstitchr/constants/defaultCliprGenerationMode";
import { defaultCliprVisualDurationSeconds } from "../lib/clipstitchr/constants/defaultCliprVisualDurationSeconds";
import { getCliprResolvedGenerationMode } from "../lib/clipstitchr/utils/getCliprResolvedGenerationMode";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

const AUTOMATION_CLIPR_ADD_MUSIC = false;
const AUTOMATION_CLIPR_DURATION_SECONDS = defaultCliprDurationSeconds;
const AUTOMATION_CLIPR_VISUAL_MODEL_ID = "kwaivgi/kling-v3-video";

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

    if (!getIsAutomationToolEnabled("clipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (!preferences?.enabled || !preferences.enabledTools.includes("clipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

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
    const defaultAvatar = await getDefaultAvatarForOwner(ctx, ownerId);
    const avatar = defaultAvatar;
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
        "Clipr automation needs one product, one default avatar, and one default avatar photo.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const requestedGenerationMode =
      preferences.cliprGenerationMode ?? defaultCliprGenerationMode;
    const taskId = `${runId}:1`;
    const generationMode = getCliprResolvedGenerationMode({
      jobId: taskId,
      mode: requestedGenerationMode,
    });
    const targetDurationSeconds =
      generationMode === "script"
        ? AUTOMATION_CLIPR_DURATION_SECONDS
        : defaultCliprVisualDurationSeconds;
    const videoModelId =
      generationMode === "script"
        ? "prunaai/p-video-avatar"
        : AUTOMATION_CLIPR_VISUAL_MODEL_ID;

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool: "clipr",
      providerCostUnits: targetDurationSeconds,
    });

    const voiceId = avatar.cliprVoiceId ?? defaultAutomationCliprVoiceId;
    const task = await createAutomationTask(ctx, {
      ownerId,
      id: taskId,
      runId,
      tool: "clipr",
      taskType: "clipr-video",
      stage: "awaiting-script-provider",
      idempotencyKey: `${ownerId}:${automationDate}:clipr:1`,
      inputSnapshotJson: JSON.stringify({
        addMusic: AUTOMATION_CLIPR_ADD_MUSIC,
        automationDate,
        requestedGenerationMode,
        generationMode,
        requestedVideoModelId: "auto",
        videoModelId,
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
        targetDurationSeconds,
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
