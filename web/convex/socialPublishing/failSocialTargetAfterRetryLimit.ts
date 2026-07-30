import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { createNotification } from "../createNotification";
import { revokeSocialMediaAccessGrants } from "../socialMedia/revokeSocialMediaAccessGrants";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export const failSocialTargetAfterRetryLimit = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
    errorMessage: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const [target, attempts] = await Promise.all([
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
        .collect(),
    ]);

    if (!target || target.postId !== args.postId) {
      return false;
    }

    if (
      target.status === "published" ||
      target.status === "waiting_for_user" ||
      target.status === "canceled"
    ) {
      await revokeSocialMediaAccessGrants(
        ctx,
        args.ownerId,
        args.targetId,
        args.now,
      );
      return true;
    }

    const runningAttempt = attempts
      .sort((left, right) => right.attemptNumber - left.attemptNumber)
      .find((attempt) => attempt.status === "running");
    const outcomeUnknown = Boolean(
      runningAttempt &&
        (runningAttempt.retrySafety === "do_not_retry_reconcile_only" ||
          runningAttempt.providerPublishId),
    );

    if (runningAttempt) {
      await ctx.db.patch(runningAttempt._id, {
        status: outcomeUnknown ? "ambiguous" : "failed",
        stage: outcomeUnknown ? "outcome_unknown" : "retry_limit",
        retrySafety: outcomeUnknown
          ? "do_not_retry_reconcile_only"
          : "review_before_retry",
        errorCode: "worker_retry_limit",
        errorMessage: args.errorMessage,
        updatedAt: args.now,
        completedAt: args.now,
      });
    }

    await ctx.db.patch(target._id, {
      status: outcomeUnknown ? "outcome_unknown" : "failed",
      nextAttemptAt: undefined,
      nextStatusCheckAt: undefined,
      outcomeUnknownAt: outcomeUnknown ? args.now : undefined,
      lastErrorCode: "worker_retry_limit",
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
      dedupeKey: `social-target-retry-limit:${args.targetId}:${runningAttempt?.id ?? args.now}`,
      title: outcomeUnknown
        ? "This post needs a careful check"
        : "A social post did not go out",
      preview: args.errorMessage.slice(0, 160),
      message: outcomeUnknown
        ? `${args.errorMessage} ClipStitchr will not send it again automatically.`
        : args.errorMessage,
      createdAt: args.now,
    });

    return true;
  },
});
