import type { QueryCtx } from "./_generated/server";

export async function getOwnerHasLegacyProductRecords(
  ctx: QueryCtx,
  ownerId: string,
) {
  const [clip, photo, avatar, stitch, avatarPreference] = await Promise.all([
    ctx.db
      .query("videoClips")
      .withIndex("by_owner_product_created", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .first(),
    ctx.db
      .query("photoAssets")
      .withIndex("by_owner_product_created", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .first(),
    ctx.db
      .query("avatars")
      .withIndex("by_owner_product_created", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .first(),
    ctx.db
      .query("stitches")
      .withIndex("by_owner_product_created", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .first(),
    ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .first(),
  ]);

  return Boolean(clip || photo || avatar || stitch || avatarPreference);
}
