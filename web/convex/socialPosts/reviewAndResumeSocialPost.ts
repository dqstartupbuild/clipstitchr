import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { findAvailableSocialQueueSlot } from "../productSocialQueues/findAvailableSocialQueueSlot";
import { rateLimiter } from "../rateLimiter";
import { refreshSocialPostStatus } from "./refreshSocialPostStatus";
import { resolveExactSocialScheduledFor } from "../../lib/clipstitchr/social/resolveExactSocialScheduledFor";
import { validateInstagramTargetControls } from "./validateInstagramTargetControls";
import { validateTikTokTargetControls } from "./validateTikTokTargetControls";

export const reviewAndResumeSocialPost = mutation({
  args: {
    id: v.string(),
    consentAcknowledged: v.boolean(),
    scheduledFor: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (!post) {
      throw new Error("Held post not found.");
    }

    const targets = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_post", (index) =>
        index.eq("ownerId", ownerId).eq("postId", post.id),
      )
      .collect();
    const resumable = targets.filter(
      (target) =>
        target.status === "held" ||
        target.status === "needs_attention" ||
        target.status === "failed",
    );

    if (resumable.length === 0) {
      throw new Error("This post has nothing ready to resume.");
    }

    if (!args.consentAcknowledged) {
      throw new Error(
        "Review the post and confirm that you agree before resuming it.",
      );
    }

    for (const target of resumable) {
      if (target.platform === "tiktok") {
        validateTikTokTargetControls(target.controlsJson, target.publishMode);
      } else {
        validateInstagramTargetControls(target.controlsJson);
      }
    }

    const accounts = await Promise.all(
      resumable.map((target) =>
        ctx.db
          .query("socialAccounts")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", ownerId).eq("id", target.socialAccountId),
          )
          .unique(),
      ),
    );

    if (
      accounts.some((account) => !account || account.status !== "connected")
    ) {
      throw new Error("Reconnect every held account before resuming.");
    }

    const hasPublishedTarget = targets.some(
      (target) => target.status === "published",
    );
    const useProductQueue =
      post.scheduleMode === "product_queue" && !hasPublishedTarget;
    let scheduledFor: string;
    let queueSlotKey: string | undefined;
    let queueRevision: number | undefined;

    if (useProductQueue) {
      const queue = await ctx.db
        .query("productSocialQueues")
        .withIndex("by_owner_product", (index) =>
          index.eq("ownerId", ownerId).eq("productId", post.productId),
        )
        .unique();

      if (!queue || queue.paused) {
        throw new Error("Turn on this product's posting queue first.");
      }

      const slot = await findAvailableSocialQueueSlot(ctx, {
        after: args.now,
        horizonDays: queue.schedulingHorizonDays,
        productId: post.productId,
        slots: queue.weeklySlots,
        timezone: queue.timezone,
      });
      scheduledFor = slot.scheduledFor;
      queueSlotKey = slot.queueSlotKey;
      queueRevision = queue.revision;
    } else {
      try {
        scheduledFor = resolveExactSocialScheduledFor(
          args.scheduledFor,
          args.now,
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes("next")) {
          throw error;
        }
        throw new Error("Choose a new future time for this post.");
      }
    }

    await assertOwnerCanPublishSocial(ctx, ownerId, args.now, scheduledFor);

    await ctx.db.patch(post._id, {
      scheduleMode: useProductQueue ? "product_queue" : "exact_time",
      scheduledFor,
      queueSlotKey,
      queueRevision,
      heldReason: undefined,
      needsAttentionReason: undefined,
      lastErrorMessage: undefined,
      approvedAt: args.now,
      consentMetadataJson: JSON.stringify({
        approvedAt: args.now,
        targets: resumable.map((target) => ({
          socialAccountId: target.socialAccountId,
          publishMode: target.publishMode,
          controls: JSON.parse(target.controlsJson),
        })),
      }),
      updatedAt: args.now,
    });

    for (const target of resumable) {
      await ctx.db.patch(target._id, {
        status: "scheduled",
        scheduledFor,
        nextAttemptAt: scheduledFor,
        providerJobId: undefined,
        claimKey: undefined,
        claimedAt: undefined,
        nextStatusCheckAt: undefined,
        outcomeUnknownAt: undefined,
        needsAttentionReason: undefined,
        lastErrorCode: undefined,
        lastErrorMessage: undefined,
        updatedAt: args.now,
      });
    }

    await refreshSocialPostStatus(ctx, ownerId, post.id, args.now);

    return { resumedTargetCount: resumable.length, scheduledFor };
  },
});
