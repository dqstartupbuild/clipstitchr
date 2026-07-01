import type { MutationCtx } from "./_generated/server";

export async function listRecentProductsForOwner(
  ctx: MutationCtx,
  ownerId: string,
  limit: number,
) {
  return await ctx.db
    .query("products")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .order("desc")
    .take(limit);
}
