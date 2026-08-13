import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";

export const list = query({
  args: {
    productId: v.string(),
    limit: v.optional(v.number()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioLazyReelBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioLazyReelActiveProduct(ctx, ownerId, productId);

    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 24)));
    const reports = ctx.db
      .query("studioLazyReelSavedReports")
      .withIndex("by_owner_product_created", (index) =>
        index.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("desc");

    if (args.includeArchived) {
      return await reports.take(limit);
    }

    return await reports
      .filter((filter) => filter.eq(filter.field("status"), "active"))
      .take(limit);
  },
});
