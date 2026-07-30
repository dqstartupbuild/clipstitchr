import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export const markSocialPublishStatusCheck = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
    attemptId: v.string(),
    providerPublishId: v.optional(v.string()),
    nextStatusCheckAt: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const [target, attempt] = await Promise.all([
      ctx.db
        .query("socialPostTargets")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.targetId),
        )
        .unique(),
      ctx.db
        .query("socialPublishAttempts")
        .withIndex("by_owner_target", (index) =>
          index.eq("ownerId", args.ownerId).eq("targetId", args.targetId),
        )
        .filter((query) => query.eq(query.field("id"), args.attemptId))
        .first(),
    ]);

    if (!target || !attempt || target.postId !== args.postId) {
      throw new Error("Social publishing target not found.");
    }

    await ctx.db.patch(attempt._id, {
      stage: "status_check",
      retrySafety: "status_only",
      providerPublishId:
        args.providerPublishId ?? attempt.providerPublishId,
      updatedAt: args.now,
    });
    await ctx.db.patch(target._id, {
      status: "status_check",
      nextAttemptAt: args.nextStatusCheckAt,
      nextStatusCheckAt: args.nextStatusCheckAt,
      updatedAt: args.now,
    });
    await refreshSocialPostStatus(ctx, args.ownerId, args.postId, args.now);
  },
});
