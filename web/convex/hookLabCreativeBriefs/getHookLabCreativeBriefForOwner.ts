import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getHookLabCreativeBriefForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  id: string,
) {
  return await ctx.db
    .query("hookLabCreativeBriefs")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", id.trim()),
    )
    .unique();
}
