import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export const startSocialPublishAttempt = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const existing = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_idempotency_key", (index) =>
        index.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();

    if (existing) {
      return existing;
    }

    const priorAttempts = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_owner_target", (index) =>
        index.eq("ownerId", args.ownerId).eq("targetId", args.targetId),
      )
      .collect();
    const attemptId = await ctx.db.insert("socialPublishAttempts", {
      ownerId: args.ownerId,
      postId: args.postId,
      targetId: args.targetId,
      id: args.id,
      attemptNumber: priorAttempts.length + 1,
      status: "running",
      stage: "claimed",
      retrySafety: "safe_before_provider_call",
      idempotencyKey: args.idempotencyKey,
      startedAt: args.now,
      updatedAt: args.now,
    });
    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.targetId),
      )
      .unique();

    if (!target || target.postId !== args.postId) {
      throw new Error("Social publishing target not found.");
    }

    await ctx.db.patch(target._id, {
      status: "publishing",
      lastAttemptAt: args.now,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });
    await refreshSocialPostStatus(ctx, args.ownerId, args.postId, args.now);

    return await ctx.db.get(attemptId);
  },
});
