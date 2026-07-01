import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getOwnerHasStitches(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  const stitch = await ctx.db
    .query("stitchCards")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .first();

  return Boolean(stitch);
}
