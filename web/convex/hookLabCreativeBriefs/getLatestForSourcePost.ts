import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getProductForOwner } from "../getProductForOwner";
import { query } from "../_generated/server";

export const getLatestForSourcePost = query({
  args: {
    sourcePostId: v.string(),
  },
  handler: async (ctx, { sourcePostId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedSourcePostId = sourcePostId.trim();

    if (!normalizedSourcePostId) {
      return null;
    }

    const brief = await ctx.db
      .query("hookLabCreativeBriefs")
      .withIndex("by_owner_created", (indexQuery) =>
        indexQuery.eq("ownerId", ownerId),
      )
      .filter((filterQuery) =>
        filterQuery.eq(
          filterQuery.field("sourcePostIds"),
          [normalizedSourcePostId],
        ),
      )
      .order("desc")
      .first();

    if (!brief) {
      return null;
    }

    const product = await getProductForOwner(ctx, ownerId, brief.productId);

    return {
      brief,
      productName: product?.name ?? null,
    };
  },
});
