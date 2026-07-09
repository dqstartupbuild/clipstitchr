import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { postBridgePostReferenceValidator } from "../validators/postBridgePostReference";
import { upsertPostBridgePostProductMapping } from "../postBridgePostProductMappings";
import { upsertSwipeCard } from "../upsertSwipeCard";
import { rateLimiter } from "../rateLimiter";

export const addCliSwipePostBridgePost = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    post: postBridgePostReferenceValidator,
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, post, secret }) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!swipe) {
      throw new Error("Swipe not found.");
    }

    const postedAt = new Date().toISOString();

    await ctx.db.patch(swipe._id, {
      isPosted: true,
      postBridgePosts: [
        ...(swipe.postBridgePosts ?? []).filter(
          (existingPost) => existingPost.postId !== post.postId,
        ),
        post,
      ],
      postedAt: swipe.postedAt ?? postedAt,
      updatedAt: postedAt,
    });

    const updatedSwipe = await ctx.db.get(swipe._id);

    if (updatedSwipe) {
      await Promise.all([
        upsertPostBridgePostProductMapping(ctx, {
          ownerId,
          post,
          productId: updatedSwipe.productSourceId,
          sourceId: updatedSwipe.id,
          sourceType: "swipe",
        }),
        upsertSwipeCard(ctx, updatedSwipe),
      ]);
    }
  },
});
