import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { defaultAutomationCliprVoiceId } from "./defaultAutomationCliprVoiceId";
import { getAutomationPreferenceForProduct } from "./getAutomationPreferenceForProduct";
import { getAutomationProductScopeKey } from "./getAutomationProductScopeKey";
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { getProductForOwner } from "./getProductForOwner";
import { listProductsForOwnerByIds } from "./listProductsForOwnerByIds";
import { listRecentAvatarPhotoAssets } from "./listRecentAvatarPhotoAssets";
import { defaultAutomationCliprGenerationMode } from "../lib/clipstitchr/constants/defaultAutomationCliprGenerationMode";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { defaultCliprDurationSeconds } from "../lib/clipstitchr/constants/defaultCliprDurationSeconds";
import { defaultCliprVisualDurationSeconds } from "../lib/clipstitchr/constants/defaultCliprVisualDurationSeconds";
import { getAutomationCliprGenerationMode } from "../lib/clipstitchr/utils/getAutomationCliprGenerationMode";
import { getCliprResolvedGenerationMode } from "../lib/clipstitchr/utils/getCliprResolvedGenerationMode";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";
import { tryReserveAiVideoForAutomation } from "./usage/tryReserveAiVideoForAutomation";

const AUTOMATION_CLIPR_ADD_MUSIC = false;
const AUTOMATION_CLIPR_DURATION_SECONDS = defaultCliprDurationSeconds;
const AUTOMATION_CLIPR_PRODUCT_PHOTO_SCAN_LIMIT = 20;
const AUTOMATION_CLIPR_SELECTED_PRODUCT_LOOKUP_LIMIT = 20;
const AUTOMATION_CLIPR_VISUAL_MODEL_ID = "kwaivgi/kling-v3-video";
const AUTOMATION_CLIPR_AVATAR_PHOTO_SCAN_LIMIT = 50;

export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, productId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);

    const productScopeKey = getAutomationProductScopeKey(productId);
    const runId = `automation:clipr:${ownerId}:${productScopeKey}:${automationDate}`;

    if (!isWithinAutomationGlobalWindow(now)) {
      return { runId, status: "skipped", taskIds: [] };
    }

    if (!getIsAutomationToolEnabled("clipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    if (!preferences?.enabled || !preferences.enabledTools.includes("clipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      productId,
      automationDate,
      tool: "clipr",
      idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:clipr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
        productId,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    const selectedProductIds = new Set(
      productId ? [productId] : preferences.selectedProductIds,
    );
    const defaultProduct = await getDefaultProductForOwner(ctx, ownerId);
    const selectedProducts =
      !productId && preferences.productSelectionMode === "selected"
        ? await listProductsForOwnerByIds(
            ctx,
            ownerId,
            [...selectedProductIds],
            AUTOMATION_CLIPR_SELECTED_PRODUCT_LOOKUP_LIMIT,
          )
        : [];
    const product = productId
      ? await getProductForOwner(ctx, ownerId, productId)
      : preferences.productSelectionMode === "selected"
        ? selectedProducts[0]
        : defaultProduct;
    const defaultAvatar = await getDefaultAvatarForOwner(
      ctx,
      ownerId,
      productId,
    );
    const avatar = defaultAvatar;
    const photos = avatar
      ? await listRecentAvatarPhotoAssets(ctx, {
          avatarId: avatar.id,
          limit: productId
            ? AUTOMATION_CLIPR_PRODUCT_PHOTO_SCAN_LIMIT
            : AUTOMATION_CLIPR_AVATAR_PHOTO_SCAN_LIMIT,
          ownerId,
          productId,
        })
      : [];
    const avatarPhoto = avatar
      ? photos.find((photo) =>
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

    const requestedGenerationMode = getAutomationCliprGenerationMode(
      preferences.cliprGenerationMode ?? defaultAutomationCliprGenerationMode,
    );
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
    const reservation = await tryReserveAiVideoForAutomation(ctx, {
      domainId: taskId,
      idempotencyKey: `clipr-video:${ownerId}:${taskId}`,
      now,
      operation: "clipr_video",
      ownerId,
    });

    if (!reservation) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Clipr automation is paused until plan access or video allowance is available.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId,
      tool: "clipr",
      providerCostUnits: targetDurationSeconds,
    });

    const voiceId = avatar.cliprVoiceId ?? defaultAutomationCliprVoiceId;
    const task = await createAutomationTask(ctx, {
      ownerId,
      productId,
      id: taskId,
      runId,
      tool: "clipr",
      taskType: "clipr-video",
      stage: "awaiting-script-provider",
      idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:clipr:1`,
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
      usageReservationId: reservation.reservationId,
    });
    await markAutomationRunStatus(ctx, {
      runDocumentId: run._id,
      status: "running",
      updatedAt: now,
    });

    return { runId, status: "running", taskIds: [task.id] };
  },
});
