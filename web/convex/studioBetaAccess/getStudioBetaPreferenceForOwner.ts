import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioBetaPreferenceForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  return await ctx.db
    .query("studioBetaPreferences")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();
}
