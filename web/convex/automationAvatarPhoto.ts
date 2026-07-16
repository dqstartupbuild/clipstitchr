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
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";
import { listRecentAvatarPhotoAssets } from "./listRecentAvatarPhotoAssets";
import { tryReserveCreationCreditsForAutomation } from "./usage/tryReserveCreationCreditsForAutomation";
import { getPlanGenerationProfile } from "../lib/clipstitchr/billing/getPlanGenerationProfile";

const AUTOMATION_AVATAR_PHOTO_PRODUCT_SOURCE_SCAN_LIMIT = 20;
const AUTOMATION_AVATAR_PHOTO_SOURCE_SCAN_LIMIT = 50;

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

    if (!isWithinAutomationGlobalWindow(now)) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    if (!getIsAutomationToolEnabled("avatar-photo")) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    if (
      !preferences?.enabled ||
      !preferences.enabledTools.includes("avatar-photo")
    ) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const defaultAvatar = await getDefaultAvatarForOwner(
      ctx,
      ownerId,
      productId,
    );
    const eligibleAvatars = defaultAvatar ? [defaultAvatar] : [];

    if (eligibleAvatars.length === 0) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const taskIds: string[] = [];

    for (const avatar of eligibleAvatars) {
      const photos = await listRecentAvatarPhotoAssets(ctx, {
        avatarId: avatar.id,
        limit: productId
          ? AUTOMATION_AVATAR_PHOTO_PRODUCT_SOURCE_SCAN_LIMIT
          : AUTOMATION_AVATAR_PHOTO_SOURCE_SCAN_LIMIT,
        ownerId,
        productId,
      });
      const sourcePhoto = photos.find((photo) =>
        photo.photoObject.contentType.startsWith("image/"),
      );
      const runId = `automation:avatar-photo:${ownerId}:${productScopeKey}:${automationDate}:${avatar.id}`;
      const idempotencyKey = `${ownerId}:${productScopeKey}:${automationDate}:avatar-photo:${avatar.id}`;
      const run = await createAutomationRun(ctx, {
        ownerId,
        id: runId,
        productId,
        automationDate,
        tool: "avatar-photo",
        idempotencyKey,
        inputSnapshotJson: JSON.stringify({
          avatarId: avatar.id,
          avatarName: avatar.name,
          productId,
          sourcePhotoId: sourcePhoto?.id,
        }),
        createdAt: now,
      });

      if (run.status !== "queued") {
        continue;
      }

      if (!sourcePhoto) {
        await markAutomationRunSkipped(
          ctx,
          run._id,
          "Avatar photo automation needs at least one source photo.",
          now,
        );
        continue;
      }

      const taskId = `automation:avatar-photo:${ownerId}:${productScopeKey}:${automationDate}:${avatar.id}:1`;
      const reservation = await tryReserveCreationCreditsForAutomation(ctx, {
        domainId: taskId,
        idempotencyKey: `avatar-photo:${ownerId}:${taskId}`,
        now,
        operation: "avatar_photo",
        ownerId,
      });

      if (!reservation?.reservationId) {
        await markAutomationRunSkipped(
          ctx,
          run._id,
          "Avatar photo automation is paused until plan access or credits are available.",
          now,
        );
        continue;
      }

      const generationProfile = getPlanGenerationProfile(reservation.planKey);

      await consumeAutomationBudget(ctx, {
        ownerId,
        productId,
        tool: "avatar-photo",
        avatarId: avatar.id,
        providerCostUnits: 1,
      });

      const task = await createAutomationTask(ctx, {
        ownerId,
        productId,
        id: taskId,
        runId,
        tool: "avatar-photo",
        taskType: "avatar-photo",
        stage: "awaiting-provider",
        idempotencyKey: `${idempotencyKey}:task`,
        inputSnapshotJson: JSON.stringify({
          automationDate,
          avatarId: avatar.id,
          avatarName: avatar.name,
          avatarDescription: avatar.description,
          avatarImageQuality: generationProfile.avatarImageQuality,
          productId,
          wardrobeStyle: avatar.wardrobeStyle,
          sourcePhotoId: sourcePhoto.id,
          sourcePhotoObject: sourcePhoto.photoObject,
        }),
        createdAt: now,
        usageReservationId: reservation.reservationId,
      });
      await markAutomationRunStatus(ctx, {
        runDocumentId: run._id,
        status: "running",
        updatedAt: now,
      });
      taskIds.push(task.id);
    }

    return {
      status: taskIds.length > 0 ? "running" : "skipped",
      taskIds,
    };
  },
});
