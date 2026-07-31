import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const listSocialSchedule = query({
  args: {
    productId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const limit = Math.max(1, Math.min(args.limit ?? 100, 300));
    const posts = (
      await ctx.db
        .query("socialPosts")
        .withIndex("by_owner_created", (index) =>
          index.eq("ownerId", ownerId),
        )
        .order("desc")
        .take(500)
    )
      .filter((post) => !args.productId || post.productId === args.productId)
      .slice(0, limit);

    return await Promise.all(
      posts.map(async (post) => {
        const [targets, assets, publications] = await Promise.all([
          ctx.db
            .query("socialPostTargets")
            .withIndex("by_owner_post", (index) =>
              index.eq("ownerId", ownerId).eq("postId", post.id),
            )
            .collect(),
          ctx.db
            .query("socialPostAssets")
            .withIndex("by_owner_post", (index) =>
              index.eq("ownerId", ownerId).eq("postId", post.id),
            )
            .collect(),
          ctx.db
            .query("socialExternalPublications")
            .withIndex("by_owner_post", (index) =>
              index.eq("ownerId", ownerId).eq("postId", post.id),
            )
            .collect(),
        ]);

        const accounts = await Promise.all(
          targets.map((target) =>
            ctx.db
              .query("socialAccounts")
              .withIndex("by_owner_id", (index) =>
                index
                  .eq("ownerId", ownerId)
                  .eq("id", target.socialAccountId),
              )
              .unique(),
          ),
        );

        return {
          ...post,
          assets: assets
            .sort((left, right) => left.order - right.order)
            .map((asset) => ({
              id: asset.id,
              kind: asset.kind,
              contentType: asset.contentType,
              width: asset.width,
              height: asset.height,
              durationSeconds: asset.durationSeconds,
            })),
          targets: targets.map((target, index) => ({
            id: target.id,
            socialAccountId: target.socialAccountId,
            platform: target.platform,
            username: target.usernameSnapshot,
            displayName: accounts[index]?.displayName,
            publishMode: target.publishMode,
            controlsJson: target.controlsJson,
            capabilitySnapshotJson:
              accounts[index]?.capabilitySnapshotJson ??
              target.capabilitySnapshotJson,
            capabilityCheckedAt: accounts[index]?.capabilityCheckedAt,
            status: target.status,
            scheduledFor: target.scheduledFor,
            needsAttentionReason: target.needsAttentionReason,
            lastErrorMessage: target.lastErrorMessage,
            publishedAt: target.publishedAt,
          })),
          publications: publications.map((publication) => ({
            id: publication.id,
            platform: publication.platform,
            externalPublicationId: publication.externalPublicationId,
            permalink: publication.permalink,
            status: publication.status,
            publishedAt: publication.publishedAt,
          })),
        };
      }),
    );
  },
});
