import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioLazyReelCreativeBriefForOwnerProduct(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  id: string,
) {
  return await ctx.db
    .query("studioLazyReelCreativeBriefs")
    .withIndex("by_owner_product_id", (query) =>
      query.eq("ownerId", ownerId).eq("productId", productId).eq("id", id),
    )
    .unique();
}
