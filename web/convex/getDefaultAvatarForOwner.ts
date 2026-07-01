import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function getDefaultAvatarForOwner(
  ctx: MutationCtx,
  ownerId: string,
  productId?: string,
): Promise<Doc<"avatars"> | null> {
  const productPreferences = productId
    ? await ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner_product", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productId),
        )
        .unique()
    : null;
  const preferences =
    productPreferences ??
    (await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", undefined),
      )
      .unique());

  if (!preferences?.defaultAvatarId) {
    return null;
  }

  const defaultAvatarId = preferences.defaultAvatarId;

  const avatar = await ctx.db
    .query("avatars")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", defaultAvatarId),
    )
    .unique();

  if (productId && avatar?.productId && avatar.productId !== productId) {
    return null;
  }

  return avatar;
}
