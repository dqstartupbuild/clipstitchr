import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { socialPlatformValidator } from "../validators/socialPlatform";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";
import { revokeSocialMediaAccessGrants } from "../socialMedia/revokeSocialMediaAccessGrants";

export const completeSocialPublishTarget = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
    attemptId: v.string(),
    platform: socialPlatformValidator,
    publicationIds: v.array(v.string()),
    awaitingUser: v.optional(v.boolean()),
    permalink: v.optional(v.string()),
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

    if (
      !target ||
      !attempt ||
      target.postId !== args.postId ||
      target.platform !== args.platform
    ) {
      throw new Error("Social publishing result no longer has a target.");
    }

    for (const externalPublicationId of Array.from(
      new Set(args.publicationIds),
    )) {
      const existing = await ctx.db
        .query("socialExternalPublications")
        .withIndex("by_platform_external", (index) =>
          index
            .eq("platform", args.platform)
            .eq("externalPublicationId", externalPublicationId),
        )
        .unique();

      if (existing) {
        if (
          existing.ownerId !== args.ownerId ||
          existing.targetId !== args.targetId
        ) {
          throw new Error(
            "The provider publication is already linked to another delivery.",
          );
        }

        await ctx.db.patch(existing._id, {
          status: "published",
          permalink: args.permalink ?? existing.permalink,
          publishedAt: existing.publishedAt ?? args.now,
          lastReconciledAt: args.now,
          updatedAt: args.now,
        });
      } else {
        await ctx.db.insert("socialExternalPublications", {
          ownerId: args.ownerId,
          postId: args.postId,
          targetId: args.targetId,
          socialAccountId: target.socialAccountId,
          platform: args.platform,
          id: `publication:${args.platform}:${externalPublicationId}`,
          externalPublicationId,
          status: "published",
          permalink: args.permalink,
          publishedAt: args.now,
          lastReconciledAt: args.now,
          createdAt: args.now,
          updatedAt: args.now,
        });
      }
    }

    const awaitingUser =
      Boolean(args.awaitingUser) && target.status !== "published";

    await ctx.db.patch(attempt._id, {
      status: "succeeded",
      stage: awaitingUser ? "delivered_to_tiktok_inbox" : "published",
      retrySafety: "terminal",
      providerResponseJson:
        args.providerResponseJson ?? attempt.providerResponseJson,
      updatedAt: args.now,
      completedAt: args.now,
    });
    await ctx.db.patch(target._id, {
      status: awaitingUser ? "waiting_for_user" : "published",
      nextAttemptAt: undefined,
      publishedAt: awaitingUser ? undefined : (target.publishedAt ?? args.now),
      nextStatusCheckAt: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });
    await revokeSocialMediaAccessGrants(
      ctx,
      args.ownerId,
      args.targetId,
      args.now,
    );
    await refreshSocialPostStatus(ctx, args.ownerId, args.postId, args.now);
  },
});
