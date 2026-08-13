import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioEditorProjectForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  id: string,
) {
  return await ctx.db
    .query("studioEditorProjects")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", id),
    )
    .unique();
}
