import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { hookLabReviewStateValidator } from "../validators/hookLabReviewState";

export const listReview = query({
  args: {
    paginationOpts: paginationOptsValidator,
    productId: v.optional(v.string()),
    reviewState: v.optional(hookLabReviewStateValidator),
  },
  handler: async (ctx, { paginationOpts, productId, reviewState = "needs_review" }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedProductId = productId?.trim() || undefined;
    const limitedPaginationOpts = {
      ...paginationOpts,
      numItems: Math.max(1, Math.min(24, Math.floor(paginationOpts.numItems))),
    };

    if (normalizedProductId) {
      return await ctx.db
        .query("stitchrHookOptions")
        .withIndex("by_owner_product_review_created", (index) =>
          index
            .eq("ownerId", ownerId)
            .eq("productId", normalizedProductId)
            .eq("reviewState", reviewState),
        )
        .order("desc")
        .paginate(limitedPaginationOpts);
    }

    return await ctx.db
      .query("stitchrHookOptions")
      .withIndex("by_owner_review_created", (index) =>
        index.eq("ownerId", ownerId).eq("reviewState", reviewState),
      )
      .order("desc")
      .paginate(limitedPaginationOpts);
  },
});
