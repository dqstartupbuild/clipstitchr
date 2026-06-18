import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function assertProductBelongsToOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId?: string,
) {
  if (!productId) {
    return;
  }

  const product = await ctx.db
    .query("products")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", productId),
    )
    .unique();

  if (!product) {
    throw new Error("Product not found.");
  }
}
