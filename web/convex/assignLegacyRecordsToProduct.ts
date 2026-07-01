import type { MutationCtx } from "./_generated/server";
import { upsertStitchCard } from "./upsertStitchCard";
import { upsertVideoClipCard } from "./upsertVideoClipCard";

const LEGACY_ASSIGNMENT_SCAN_LIMIT = 1000;

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
        .take(LEGACY_ASSIGNMENT_SCAN_LIMIT),
      ctx.db
        .query("photoAssets")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .take(LEGACY_ASSIGNMENT_SCAN_LIMIT),
      ctx.db
        .query("avatars")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .take(LEGACY_ASSIGNMENT_SCAN_LIMIT),
      ctx.db
        .query("stitches")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .take(LEGACY_ASSIGNMENT_SCAN_LIMIT),
      ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .take(LEGACY_ASSIGNMENT_SCAN_LIMIT),
    ]);

  let updatedCount = 0;

  for (const clip of clips) {
    if (!clip.productId) {
      await ctx.db.patch(clip._id, { productId });
      await upsertVideoClipCard(ctx, { ...clip, productId });
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
      await upsertStitchCard(ctx, { ...stitch, productId });
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
