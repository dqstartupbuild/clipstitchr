import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { upsertPostBridgePostProductMapping } from "./postBridgePostProductMappings";

export const backfillLegacyPostBridgePostProductMappings = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
    sourceType: v.union(v.literal("stitch"), v.literal("swipe")),
  },
  handler: async (ctx, { paginationOpts, secret, sourceType }) => {
    assertRateLimitApiSecret(secret);

    let mappedPosts = 0;
    let skippedPosts = 0;

    if (sourceType === "stitch") {
      const page = await ctx.db.query("stitches").paginate(paginationOpts);

      for (const stitch of page.page) {
        const productId = stitch.productId?.trim();
        const postBridgePosts = stitch.postBridgePosts ?? [];

        if (!productId) {
          skippedPosts += postBridgePosts.length;
          continue;
        }

        for (const post of postBridgePosts) {
          await upsertPostBridgePostProductMapping(ctx, {
            ownerId: stitch.ownerId,
            post,
            productId,
            sourceId: stitch.id,
            sourceType,
          });
          mappedPosts += 1;
        }
      }

      return {
        continueCursor: page.continueCursor,
        isDone: page.isDone,
        mappedPosts,
        processed: page.page.length,
        skippedPosts,
      };
    }

    const page = await ctx.db.query("swipes").paginate(paginationOpts);

    for (const swipe of page.page) {
      const productId = swipe.productSourceId.trim();
      const postBridgePosts = swipe.postBridgePosts ?? [];

      if (!productId) {
        skippedPosts += postBridgePosts.length;
        continue;
      }

      for (const post of postBridgePosts) {
        await upsertPostBridgePostProductMapping(ctx, {
          ownerId: swipe.ownerId,
          post,
          productId,
          sourceId: swipe.id,
          sourceType,
        });
        mappedPosts += 1;
      }
    }

    return {
      continueCursor: page.continueCursor,
      isDone: page.isDone,
      mappedPosts,
      processed: page.page.length,
      skippedPosts,
    };
  },
});
