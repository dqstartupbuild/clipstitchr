import type { MutationCtx } from "../_generated/server";

export async function assertStudioBetaR2ActiveProduct(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
) {
  const product = await ctx.db
    .query("products")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", productId),
    )
    .unique();

  if (!product || product.archivedAt) {
    throw new Error("Active Product not found.");
  }

  return product;
}
