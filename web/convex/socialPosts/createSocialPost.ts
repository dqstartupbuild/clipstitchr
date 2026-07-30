import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { findAvailableSocialQueueSlot } from "../productSocialQueues/findAvailableSocialQueueSlot";
import { rateLimiter } from "../rateLimiter";
import { assertSocialAssetObjectKeyBelongsToOwner } from "../social/assertSocialAssetObjectKeyBelongsToOwner";
import { socialPostAssetInputValidator } from "../validators/socialPostAssetInput";
import { socialPostTargetInputValidator } from "../validators/socialPostTargetInput";
import { socialScheduleModeValidator } from "../validators/socialScheduleMode";
import { assertSocialPendingLimits } from "./assertSocialPendingLimits";
import { validateInstagramTargetControls } from "./validateInstagramTargetControls";
import { validateSocialPostAssets } from "./validateSocialPostAssets";
import { validateTikTokTargetControls } from "./validateTikTokTargetControls";
import { resolveExactSocialScheduledFor } from "../../lib/clipstitchr/social/resolveExactSocialScheduledFor";

export const createSocialPost = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    sourceType: v.string(),
    sourceId: v.string(),
    title: v.string(),
    caption: v.string(),
    scheduleMode: socialScheduleModeValidator,
    scheduledFor: v.optional(v.string()),
    assets: v.array(socialPostAssetInputValidator),
    targets: v.array(socialPostTargetInputValidator),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const caption = args.caption.trim();
    const nowMs = Date.parse(args.now);

    if (!Number.isFinite(nowMs)) {
      throw new Error("The current time is invalid.");
    }

    await rateLimiter.limit(ctx, "socialScheduleCreate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "socialScheduleCreateDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "socialScheduleCreateGlobal", {
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    if (caption.length > 2_200) {
      throw new Error("Keep the caption at 2,200 characters or fewer.");
    }

    if (args.targets.length < 1) {
      throw new Error("Choose at least one connected account.");
    }

    const targetIds = new Set(args.targets.map((target) => target.id));
    const accountIds = new Set(
      args.targets.map((target) => target.socialAccountId),
    );

    if (
      targetIds.size !== args.targets.length ||
      accountIds.size !== args.targets.length
    ) {
      throw new Error("Choose each connected account once.");
    }

    await assertSocialPendingLimits(ctx, ownerId, args.targets.length);

    const accounts = await Promise.all(
      args.targets.map((target) =>
        ctx.db
          .query("socialAccounts")
          .withIndex("by_owner_id", (index) =>
            index
              .eq("ownerId", ownerId)
              .eq("id", target.socialAccountId),
          )
          .unique(),
      ),
    );

    if (
      accounts.some(
        (account) => !account || account.status !== "connected",
      )
    ) {
      throw new Error("Reconnect every selected account before scheduling.");
    }

    const platforms = accounts.map((account) => account!.platform);

    validateSocialPostAssets(args.assets, platforms);

    for (const asset of args.assets) {
      assertSocialAssetObjectKeyBelongsToOwner(asset.objectKey, ownerId);
    }

    for (const [index, target] of args.targets.entries()) {
      const account = accounts[index]!;

      if (account.platform === "tiktok") {
        validateTikTokTargetControls(target.controlsJson, target.publishMode);
      } else {
        if (
          account.accountType !== "BUSINESS" &&
          account.accountType !== "MEDIA_CREATOR"
        ) {
          throw new Error(
            "Instagram publishing needs a professional account.",
          );
        }
        validateInstagramTargetControls(target.controlsJson);
      }
    }

    let scheduledFor = args.now;
    let queueRevision: number | undefined;
    let queueSlotKey: string | undefined;

    if (args.scheduleMode === "exact_time") {
      scheduledFor = resolveExactSocialScheduledFor(
        args.scheduledFor,
        args.now,
      );
    } else if (args.scheduleMode === "product_queue") {
      const queue = await ctx.db
        .query("productSocialQueues")
        .withIndex("by_owner_product", (index) =>
          index.eq("ownerId", ownerId).eq("productId", args.productId),
        )
        .unique();

      if (!queue) {
        throw new Error("Set up this product's posting queue first.");
      }

      if (queue.paused) {
        throw new Error("Turn on this product's posting queue first.");
      }

      const slot = await findAvailableSocialQueueSlot(ctx, {
        after: args.now,
        horizonDays: queue.schedulingHorizonDays,
        productId: args.productId,
        slots: queue.weeklySlots,
        timezone: queue.timezone,
      });
      scheduledFor = slot.scheduledFor;
      queueRevision = queue.revision;
      queueSlotKey = slot.queueSlotKey;
    }

    const entitlement = await assertOwnerCanPublishSocial(
      ctx,
      ownerId,
      args.now,
      scheduledFor,
    );

    const targetSnapshotJson = JSON.stringify(
      accounts.map((account, index) => ({
        accountId: account!.id,
        externalAccountId: account!.externalAccountId,
        platform: account!.platform,
        publishMode: args.targets[index].publishMode,
        username: account!.username,
      })),
    );
    await ctx.db.insert("socialPosts", {
      ownerId,
      id: args.id,
      productId: args.productId,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      title: args.title.trim() || "Untitled post",
      caption,
      scheduleMode: args.scheduleMode,
      scheduledFor,
      queueRevision,
      queueSlotKey,
      targetSnapshotJson,
      approvedAt: args.now,
      consentMetadataJson: JSON.stringify({
        approvedAt: args.now,
        targets: args.targets.map((target) => ({
          socialAccountId: target.socialAccountId,
          publishMode: target.publishMode,
          controls: JSON.parse(target.controlsJson),
        })),
      }),
      status: "scheduled",
      createdAt: args.now,
      updatedAt: args.now,
    });

    for (const asset of args.assets) {
      await ctx.db.insert("socialPostAssets", {
        ownerId,
        postId: args.id,
        ...asset,
        createdAt: args.now,
      });
    }

    for (const [index, target] of args.targets.entries()) {
      const account = accounts[index]!;

      await ctx.db.insert("socialPostTargets", {
        ownerId,
        postId: args.id,
        id: target.id,
        socialAccountId: account.id,
        platform: account.platform,
        externalAccountIdSnapshot: account.externalAccountId,
        usernameSnapshot: account.username,
        publishMode: target.publishMode,
        controlsJson: target.controlsJson,
        capabilitySnapshotJson: account.capabilitySnapshotJson,
        scheduledFor,
        nextAttemptAt: scheduledFor,
        entitlementDecisionJson: JSON.stringify({
          checkedAt: args.now,
          currentPeriodEnd: entitlement.currentPeriodEnd,
          cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
          state: entitlement.state,
        }),
        status: "scheduled",
        createdAt: args.now,
        updatedAt: args.now,
      });
    }

    return { id: args.id, scheduledFor, targetCount: args.targets.length };
  },
});
