import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { rateLimiter } from "../rateLimiter";
import { enqueueSocialTargetProviderJob } from "../socialPublishing/enqueueSocialTargetProviderJob";
import { refreshSocialPostStatus } from "./refreshSocialPostStatus";

export const reconcileSocialPostTarget = mutation({
  args: {
    id: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await assertOwnerCanPublishSocial(ctx, ownerId, args.now);

    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (!target || target.status !== "outcome_unknown") {
      throw new Error("This destination does not need reconciliation.");
    }

    const attempts = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_owner_target", (index) =>
        index.eq("ownerId", ownerId).eq("targetId", target.id),
      )
      .collect();
    const attempt = attempts
      .sort((left, right) => right.attemptNumber - left.attemptNumber)
      .find(
        (candidate) =>
          candidate.status === "ambiguous" &&
          Boolean(candidate.providerPublishId),
      );

    if (!attempt || target.platform !== "tiktok") {
      throw new Error(
        "ClipStitchr will not resend this post. Check the connected account before deciding what to do next.",
      );
    }

    await ctx.db.patch(attempt._id, {
      status: "running",
      stage: "status_reconciliation",
      updatedAt: args.now,
      completedAt: undefined,
    });
    const idempotencyKey = `social-manual-reconcile:${target.id}:${args.now}`;
    const job = await enqueueSocialTargetProviderJob(ctx, {
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({
        postId: target.postId,
        targetId: target.id,
      }),
      jobId: `provider:${idempotencyKey}`,
      jobType: "social-status-reconcile",
      now: args.now,
      ownerId,
    });
    await ctx.db.patch(target._id, {
      status: "queued",
      providerJobId: job.id,
      nextStatusCheckAt: undefined,
      updatedAt: args.now,
    });
    await refreshSocialPostStatus(ctx, ownerId, target.postId, args.now);

    return { providerJobId: job.id };
  },
});
