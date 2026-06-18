import type { MutationCtx } from "./_generated/server";

export async function assignLegacyRecordsToProduct(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
  updatedAt: string,
) {
  const [clips, photos, avatars, stitches, avatarPreferences] =
    await Promise.all([
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .collect(),
      ctx.db
        .query("photoAssets")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .collect(),
      ctx.db
        .query("avatars")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .collect(),
      ctx.db
        .query("stitches")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .collect(),
      ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .collect(),
    ]);

  let updatedCount = 0;

  for (const clip of clips) {
    if (!clip.productId) {
      await ctx.db.patch(clip._id, { productId });
      updatedCount += 1;
    }
  }

  for (const photo of photos) {
    if (!photo.productId) {
      await ctx.db.patch(photo._id, { productId, updatedAt });
      updatedCount += 1;
    }
  }

  for (const avatar of avatars) {
    if (!avatar.productId) {
      await ctx.db.patch(avatar._id, { productId, updatedAt });
      updatedCount += 1;
    }
  }

  for (const stitch of stitches) {
    if (!stitch.productId) {
      await ctx.db.patch(stitch._id, { productId });
      updatedCount += 1;
    }
  }

  for (const preference of avatarPreferences) {
    if (!preference.productId) {
      await ctx.db.patch(preference._id, { productId, updatedAt });
      updatedCount += 1;
    }
  }

  return updatedCount;
}
