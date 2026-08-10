import type { MutationCtx } from "./_generated/server";

export async function clearSocialPublishingSocialAccountIdsForOwner(
  ctx: MutationCtx,
  ownerId: string,
  updatedAt: string,
) {
  const products = await ctx.db
    .query("products")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const product of products) {
    if (product.socialPublishingSocialAccountIds === undefined) {
      continue;
    }

    await ctx.db.patch(product._id, {
      socialPublishingSocialAccountIds: undefined,
      updatedAt,
    });
  }

  const productCards = await ctx.db
    .query("productCards")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  for (const productCard of productCards) {
    if (productCard.socialPublishingSocialAccountIds === undefined) {
      continue;
    }

    await ctx.db.patch(productCard._id, {
      socialPublishingSocialAccountIds: undefined,
      updatedAt,
    });
  }
}
