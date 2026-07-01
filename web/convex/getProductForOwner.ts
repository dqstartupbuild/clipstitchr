import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getProductForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
) {
  return await ctx.db
    .query("products")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", productId),
    )
    .unique();
}
