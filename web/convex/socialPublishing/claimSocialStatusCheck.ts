import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { enqueueSocialTargetProviderJob } from "./enqueueSocialTargetProviderJob";

export const claimSocialStatusCheck = internalMutation({
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
      target.status !== "status_check" ||
      !target.nextStatusCheckAt ||
      Date.parse(target.nextStatusCheckAt) > Date.parse(now)
    ) {
      return null;
    }

    const idempotencyKey = `social-status:${target.id}:${target.nextStatusCheckAt}`;
    const job = await enqueueSocialTargetProviderJob(ctx, {
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({
        postId: target.postId,
        targetId: target.id,
      }),
      jobId: `provider:${idempotencyKey}`,
      jobType: "social-status-reconcile",
      now,
      ownerId: target.ownerId,
    });

    await ctx.db.patch(target._id, {
      providerJobId: job.id,
      nextAttemptAt: undefined,
      status: "queued",
      updatedAt: now,
    });

    return job.id;
  },
});
