import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";
import { enqueueSocialTargetProviderJob } from "./enqueueSocialTargetProviderJob";

export const claimDueSocialTarget = internalMutation({
  args: {
    targetId: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { targetId, now }) => {
    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_target_id", (index) => index.eq("id", targetId))
      .unique();

    if (
      !target ||
      target.status !== "scheduled" ||
      Date.parse(target.scheduledFor) > Date.parse(now)
    ) {
      return null;
    }

    const [post, account] = await Promise.all([
      ctx.db
        .query("socialPosts")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", target.ownerId).eq("id", target.postId),
        )
        .unique(),
      ctx.db
        .query("socialAccounts")
        .withIndex("by_owner_id", (index) =>
          index
            .eq("ownerId", target.ownerId)
            .eq("id", target.socialAccountId),
        )
        .unique(),
    ]);

    if (!post || !account || account.status !== "connected") {
      await ctx.db.patch(target._id, {
        status: "held",
        needsAttentionReason:
          "Reconnect this account, then review and resume the post.",
        updatedAt: now,
      });
      await refreshSocialPostStatus(ctx, target.ownerId, target.postId, now);
      return null;
    }

    let entitlement;

    try {
      entitlement = await assertOwnerCanPublishSocial(
        ctx,
        target.ownerId,
        now,
      );
    } catch {
      await ctx.db.patch(target._id, {
        status: "held",
        nextAttemptAt: undefined,
        needsAttentionReason: "Subscription inactive - scheduled posts held.",
        updatedAt: now,
      });
      await refreshSocialPostStatus(ctx, target.ownerId, target.postId, now);
      return null;
    }

    const claimKey = `social-publish:${target.id}:${target.scheduledFor}`;
    const jobId = `provider:${claimKey}`;
    const job = await enqueueSocialTargetProviderJob(ctx, {
      idempotencyKey: claimKey,
      inputSnapshotJson: JSON.stringify({
        postId: post.id,
        targetId: target.id,
      }),
      jobId,
      jobType: "social-publish",
      now,
      ownerId: target.ownerId,
    });

    await ctx.db.patch(target._id, {
      claimKey,
      claimedAt: now,
      providerJobId: job.id,
      nextAttemptAt: undefined,
      entitlementDecisionJson: JSON.stringify({
        checkedAt: now,
        currentPeriodEnd: entitlement.currentPeriodEnd,
        cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
        state: entitlement.state,
      }),
      status: "queued",
      updatedAt: now,
    });
    await refreshSocialPostStatus(ctx, target.ownerId, target.postId, now);

    return job.id;
  },
});
