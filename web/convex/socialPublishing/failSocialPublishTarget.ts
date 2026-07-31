import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";
import { createNotification } from "../createNotification";
import { revokeSocialMediaAccessGrants } from "../socialMedia/revokeSocialMediaAccessGrants";

export const failSocialPublishTarget = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
    attemptId: v.string(),
    errorCode: v.optional(v.string()),
    errorMessage: v.string(),
    needsAttention: v.optional(v.boolean()),
    outcomeUnknown: v.optional(v.boolean()),
    providerResponseJson: v.optional(v.string()),
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

    if (
      target.status === "published" ||
      target.status === "waiting_for_user" ||
      target.status === "canceled" ||
      attempt.status === "succeeded"
    ) {
      await revokeSocialMediaAccessGrants(
        ctx,
        args.ownerId,
        args.targetId,
        args.now,
      );
      return;
    }

    const status = args.outcomeUnknown
      ? ("outcome_unknown" as const)
      : args.needsAttention
        ? ("needs_attention" as const)
        : ("failed" as const);

    await ctx.db.patch(attempt._id, {
      status: args.outcomeUnknown ? "ambiguous" : "failed",
      stage: args.outcomeUnknown ? "outcome_unknown" : "failed",
      retrySafety: args.outcomeUnknown
        ? "do_not_retry_reconcile_only"
        : "review_before_retry",
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      providerResponseJson:
        args.providerResponseJson ?? attempt.providerResponseJson,
      updatedAt: args.now,
      completedAt: args.now,
    });
    await ctx.db.patch(target._id, {
      status,
      nextAttemptAt: undefined,
      outcomeUnknownAt: args.outcomeUnknown ? args.now : undefined,
      needsAttentionReason: args.needsAttention ? args.errorMessage : undefined,
      lastErrorCode: args.errorCode,
      lastErrorMessage: args.errorMessage,
      updatedAt: args.now,
    });
    await revokeSocialMediaAccessGrants(
      ctx,
      args.ownerId,
      args.targetId,
      args.now,
    );
    await refreshSocialPostStatus(ctx, args.ownerId, args.postId, args.now);
    await createNotification(ctx, {
      ownerId: args.ownerId,
      sourceType: "social-post",
      sourceId: args.postId,
      dedupeKey: `social-target-failed:${args.targetId}:${args.attemptId}`,
      title: args.outcomeUnknown
        ? "This post needs a careful check"
        : args.needsAttention
          ? "Review this social post"
          : "A social post did not go out",
      preview: args.errorMessage.slice(0, 160),
      message: args.outcomeUnknown
        ? `${args.errorMessage} ClipStitchr will not send it again automatically.`
        : args.errorMessage,
      createdAt: args.now,
    });
  },
});
