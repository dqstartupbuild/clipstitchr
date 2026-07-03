import type { MutationCtx } from "./_generated/server";

export async function clearPostBridgeSocialAccountIdsForOwner(
  ctx: MutationCtx,
  ownerId: string,
  updatedAt: string,
) {
  const products = await ctx.db
    .query("products")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const product of products) {
    if (product.postBridgeSocialAccountIds === undefined) {
      continue;
    }

    await ctx.db.patch(product._id, {
      postBridgeSocialAccountIds: undefined,
      updatedAt,
    });
  }

  const productCards = await ctx.db
    .query("productCards")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const productCard of productCards) {
    if (productCard.postBridgeSocialAccountIds === undefined) {
      continue;
    }

    await ctx.db.patch(productCard._id, {
      postBridgeSocialAccountIds: undefined,
      updatedAt,
    });
  }
}
