import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioClipsProductIsOwnedActive(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
) {
  const product = await ctx.db
    .query("products")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", productId),
    )
    .unique();
  return Boolean(product && !product.archivedAt);
}
