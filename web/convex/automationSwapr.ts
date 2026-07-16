import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { getAutomationPreferenceForProduct } from "./getAutomationPreferenceForProduct";
import { getAutomationProductScopeKey } from "./getAutomationProductScopeKey";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";
import { listRecentAvatarPhotoAssets } from "./listRecentAvatarPhotoAssets";
import { listRecentVideoClipCardsByLibraryKind } from "./listRecentVideoClipCardsByLibraryKind";
import { tryReserveAiVideoForAutomation } from "./usage/tryReserveAiVideoForAutomation";
import { getPlanGenerationProfile } from "../lib/clipstitchr/billing/getPlanGenerationProfile";

const AUTOMATION_SWAPR_PRODUCT_PHOTO_SCAN_LIMIT = 20;
const AUTOMATION_SWAPR_KEEP_ORIGINAL_SOUND = false;
const AUTOMATION_SWAPR_REFERENCE_CLIP_SCAN_LIMIT = 100;
const AUTOMATION_SWAPR_PROMPT =
  "Keep the creator in a natural phone-camera UGC style with the same casual setting and lighting.";
const AUTOMATION_SWAPR_REFERENCE_DURATION_LIMIT_SECONDS = 10;
const AUTOMATION_SWAPR_REFERENCE_MAX_SIZE_BYTES = 100 * 1024 * 1024;
const AUTOMATION_SWAPR_AVATAR_PHOTO_SCAN_LIMIT = 50;

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
    const runId = `automation:swapr:${ownerId}:${productScopeKey}:${automationDate}`;

    if (!isWithinAutomationGlobalWindow(now)) {
      return { runId, status: "skipped", taskIds: [] };
    }

    if (!getIsAutomationToolEnabled("swapr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    if (!preferences?.enabled || !preferences.enabledTools.includes("swapr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      productId,
      automationDate,
      tool: "swapr",
      idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:swapr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
        productId,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    const defaultAvatar = await getDefaultAvatarForOwner(
      ctx,
      ownerId,
      productId,
    );
    if (!defaultAvatar) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation needs a default avatar.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const photos = await listRecentAvatarPhotoAssets(ctx, {
      avatarId: defaultAvatar.id,
      limit: productId
        ? AUTOMATION_SWAPR_PRODUCT_PHOTO_SCAN_LIMIT
        : AUTOMATION_SWAPR_AVATAR_PHOTO_SCAN_LIMIT,
      ownerId,
      productId,
    });
    const sourcePhoto = photos.find((photo) =>
      photo.photoObject.contentType.startsWith("image/"),
    );
    const clips = await listRecentVideoClipCardsByLibraryKind(ctx, {
      libraryKind: "ugc",
      limit: AUTOMATION_SWAPR_REFERENCE_CLIP_SCAN_LIMIT,
      ownerId,
      productId,
    });
    const referenceClip = clips.find(
      (clip) =>
        clip.clipType === "ugc" &&
        clip.videoObject.contentType.startsWith("video/") &&
        clip.videoObject.size <= AUTOMATION_SWAPR_REFERENCE_MAX_SIZE_BYTES &&
        clip.duration >= 3 &&
        clip.duration <= AUTOMATION_SWAPR_REFERENCE_DURATION_LIMIT_SECONDS,
    );

    if (!sourcePhoto || !referenceClip) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation needs an avatar photo and one provider-ready UGC reference video.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const taskId = `${runId}:1`;
    const reservation = await tryReserveAiVideoForAutomation(ctx, {
      domainId: taskId,
      idempotencyKey: `swapr-video:${ownerId}:${taskId}`,
      now,
      operation: "swapr_video",
      ownerId,
    });

    if (!reservation) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation is paused until plan access or video allowance is available.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }
    const generationProfile = getPlanGenerationProfile(reservation.planKey);

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId,
      tool: "swapr",
      providerCostUnits: 10,
    });

    const task = await createAutomationTask(ctx, {
      ownerId,
      productId,
      id: taskId,
      runId,
      tool: "swapr",
      taskType: "swapr-video",
      stage: "awaiting-provider",
      idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:swapr:1`,
      inputSnapshotJson: JSON.stringify({
        automationDate,
        characterOrientation: generationProfile.swaprCharacterOrientation,
        keepOriginalSound: AUTOMATION_SWAPR_KEEP_ORIGINAL_SOUND,
        mode: generationProfile.swaprMode,
        productId,
        photoId: sourcePhoto.id,
        photoObject: sourcePhoto.photoObject,
        prompt: AUTOMATION_SWAPR_PROMPT,
        referenceClipId: referenceClip.id,
        referenceClipName: referenceClip.name,
        referenceDurationSeconds: referenceClip.duration,
        referenceVideoObject: referenceClip.videoObject,
        sourcePhotoName: sourcePhoto.name,
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
