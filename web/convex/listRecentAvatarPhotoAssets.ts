import type { MutationCtx } from "./_generated/server";

export async function listRecentAvatarPhotoAssets(
  ctx: MutationCtx,
  {
    avatarId,
    limit,
    ownerId,
    productId,
  }: {
    avatarId: string;
    limit: number;
    ownerId: string;
    productId?: string;
  },
) {
  if (productId) {
    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_product_created", (q) =>
        q
          .eq("ownerId", ownerId)
          .eq("avatarId", avatarId)
          .eq("productId", productId),
      )
      .order("desc")
      .take(limit);
  }

  return await ctx.db
    .query("photoAssets")
    .withIndex("by_owner_avatar_created", (q) =>
      q.eq("ownerId", ownerId).eq("avatarId", avatarId),
    )
    .order("desc")
    .take(limit);
}
