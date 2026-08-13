import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioClipsProductStyleForOwnerProduct(
  ctx: MutationCtx | QueryCtx,
  input: { ownerId: string; productId: string },
) {
  return await ctx.db
    .query("studioClipsProductStyles")
    .withIndex("by_owner_product", (query) =>
      query.eq("ownerId", input.ownerId).eq("productId", input.productId),
    )
    .unique();
}
