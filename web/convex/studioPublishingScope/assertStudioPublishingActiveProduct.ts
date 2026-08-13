import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function assertStudioPublishingActiveProduct(
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

  if (!product || product.archivedAt) {
    throw new Error("Choose an active Product before opening Postiz Beta.");
  }

  return product;
}
