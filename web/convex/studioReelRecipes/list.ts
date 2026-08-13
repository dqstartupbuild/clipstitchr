import { v } from "convex/values";
import { query } from "../_generated/server";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";

export const list = query({
  args: {
    productId: v.string(),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 30)));
    return args.includeArchived
      ? await ctx.db
          .query("studioReelRecipes")
          .withIndex("by_owner_product_updated", (query) =>
            query.eq("ownerId", ownerId).eq("productId", productId),
          )
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("studioReelRecipes")
          .withIndex("by_owner_product_status_updated", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("productId", productId)
              .eq("status", "active"),
          )
          .order("desc")
          .take(limit);
  },
});
