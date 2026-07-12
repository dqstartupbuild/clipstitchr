import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const listStitchSources = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedProductId = productId?.trim() || undefined;
    const stitches = normalizedProductId
      ? await ctx.db
          .query("stitchCards")
          .withIndex("by_owner_product_created", (query) =>
            query.eq("ownerId", ownerId).eq("productId", normalizedProductId),
          )
          .order("desc")
          .take(60)
      : await ctx.db
          .query("stitchCards")
          .withIndex("by_owner_created", (query) => query.eq("ownerId", ownerId))
          .order("desc")
          .take(60);

    return stitches.map((stitch) => ({
      createdAt: stitch.createdAt,
      id: stitch.id,
      name: stitch.name,
      posterObject: stitch.posterObject,
      productId: stitch.productId,
    }));
  },
});
