import type { MutationCtx } from "./_generated/server";

export async function getStitchProductId(
  ctx: MutationCtx,
  ownerId: string,
  demoClipId: string,
) {
  const demoClip = await ctx.db
    .query("videoClips")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", demoClipId),
    )
    .unique();

  return demoClip?.productId;
}
