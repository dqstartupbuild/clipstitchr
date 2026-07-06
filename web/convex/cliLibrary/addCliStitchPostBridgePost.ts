import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { postBridgePostReferenceValidator } from "../validators/postBridgePostReference";
import { upsertPostBridgePostProductMapping } from "../postBridgePostProductMappings";
import { stitchCounts, stitchProductCounts } from "../aggregateCounts";
import { upsertStitchCard } from "../upsertStitchCard";
import { rateLimiter } from "../rateLimiter";

export const addCliStitchPostBridgePost = mutation({
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

    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    const postedAt = new Date().toISOString();

    await ctx.db.patch(stitch._id, {
      isPosted: true,
      postBridgePosts: [
        ...(stitch.postBridgePosts ?? []).filter(
          (existingPost) => existingPost.postId !== post.postId,
        ),
        post,
      ],
      postedAt: stitch.postedAt ?? postedAt,
    });

    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertPostBridgePostProductMapping(ctx, {
          ownerId,
          post,
          productId: updatedStitch.productId,
          sourceId: updatedStitch.id,
          sourceType: "stitch",
        }),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});
