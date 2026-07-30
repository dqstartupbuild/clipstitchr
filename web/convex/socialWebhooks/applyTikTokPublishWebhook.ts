import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { createNotification } from "../createNotification";
import { revokeSocialMediaAccessGrants } from "../socialMedia/revokeSocialMediaAccessGrants";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export const applyTikTokPublishWebhook = mutation({
  args: {
    secret: v.string(),
    publishId: v.string(),
    status: v.string(),
    publicationIds: v.array(v.string()),
    errorMessage: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const attempt = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_provider_publish", (index) =>
        index.eq("providerPublishId", args.publishId),
      )
      .unique();

    if (!attempt) {
      return false;
    }

    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", attempt.ownerId).eq("id", attempt.targetId),
      )
      .unique();

    if (!target || target.platform !== "tiktok") {
      return false;
    }

    if (args.status === "failed") {
      if (
        attempt.status === "succeeded" ||
        target.status === "published" ||
        target.status === "waiting_for_user"
      ) {
        await revokeSocialMediaAccessGrants(
          ctx,
          attempt.ownerId,
          attempt.targetId,
          args.now,
        );
        return true;
      }

      await ctx.db.patch(attempt._id, {
        status: "failed",
        stage: "webhook_failed",
        retrySafety: "review_before_retry",
        errorMessage:
          args.errorMessage || "TikTok could not publish this post.",
        updatedAt: args.now,
        completedAt: args.now,
      });
      await ctx.db.patch(target._id, {
        status: "failed",
        nextAttemptAt: undefined,
        nextStatusCheckAt: undefined,
        lastErrorMessage:
          args.errorMessage || "TikTok could not publish this post.",
        updatedAt: args.now,
      });
      await revokeSocialMediaAccessGrants(
        ctx,
        attempt.ownerId,
        attempt.targetId,
        args.now,
      );
      await refreshSocialPostStatus(
        ctx,
        attempt.ownerId,
        attempt.postId,
        args.now,
      );
      await createNotification(ctx, {
        ownerId: attempt.ownerId,
        sourceType: "social-post",
        sourceId: attempt.postId,
        dedupeKey: `social-target-webhook-failed:${attempt.targetId}:${attempt.id}`,
        title: "A social post did not go out",
        preview: (
          args.errorMessage || "TikTok could not publish this post."
        ).slice(0, 160),
        message: args.errorMessage || "TikTok could not publish this post.",
        createdAt: args.now,
      });
      return true;
    }

    for (const publicationId of Array.from(new Set(args.publicationIds))) {
      const existing = await ctx.db
        .query("socialExternalPublications")
        .withIndex("by_platform_external", (index) =>
          index
            .eq("platform", "tiktok")
            .eq("externalPublicationId", publicationId),
        )
        .unique();

      if (
        existing &&
        (existing.ownerId !== attempt.ownerId ||
          existing.targetId !== attempt.targetId)
      ) {
        throw new Error(
          "The TikTok publication is already linked to another delivery.",
        );
      }

      if (!existing) {
        await ctx.db.insert("socialExternalPublications", {
          ownerId: attempt.ownerId,
          postId: attempt.postId,
          targetId: attempt.targetId,
          socialAccountId: target.socialAccountId,
          platform: "tiktok",
          id: `publication:tiktok:${publicationId}`,
          externalPublicationId: publicationId,
          status: "published",
          publishedAt: args.now,
          lastReconciledAt: args.now,
          createdAt: args.now,
          updatedAt: args.now,
        });
      }
    }

    await ctx.db.patch(attempt._id, {
      status: "succeeded",
      stage: "webhook_complete",
      retrySafety: "terminal",
      updatedAt: args.now,
      completedAt: args.now,
    });
    const published =
      target.status === "published" || args.publicationIds.length > 0;

    await ctx.db.patch(target._id, {
      status: published ? "published" : "waiting_for_user",
      publishedAt:
        published
          ? (target.publishedAt ?? args.now)
          : undefined,
      nextAttemptAt: undefined,
      nextStatusCheckAt: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });
    await revokeSocialMediaAccessGrants(
      ctx,
      attempt.ownerId,
      attempt.targetId,
      args.now,
    );
    await refreshSocialPostStatus(
      ctx,
      attempt.ownerId,
      attempt.postId,
      args.now,
    );

    return true;
  },
});
