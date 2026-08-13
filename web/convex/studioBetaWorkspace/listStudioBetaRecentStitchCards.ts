import type { QueryCtx } from "../_generated/server";

export async function listStudioBetaRecentStitchCards(
  ctx: QueryCtx,
  ownerId: string,
  productId: string,
) {
  return await ctx.db
    .query("stitchCards")
    .withIndex("by_owner_product_created", (query) =>
      query.eq("ownerId", ownerId).eq("productId", productId),
    )
    .order("desc")
    .take(8);
}
