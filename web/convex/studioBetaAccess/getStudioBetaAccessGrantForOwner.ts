import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioBetaAccessGrantForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  return await ctx.db
    .query("studioBetaAccessGrants")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();
}
