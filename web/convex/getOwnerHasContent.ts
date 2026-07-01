import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getOwnerHasContent(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  const [clip, photo, avatar, stitch, swipe] = await Promise.all([
    ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .first(),
    ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .first(),
    ctx.db
      .query("avatars")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .first(),
    ctx.db
      .query("stitchCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .first(),
    ctx.db
      .query("swipeCards")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
      .first(),
  ]);

  return Boolean(clip || photo || avatar || stitch || swipe);
}
