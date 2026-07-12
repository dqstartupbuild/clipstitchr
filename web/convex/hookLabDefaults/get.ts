import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const get = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedProductId = productId.trim();
    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", normalizedProductId),
      )
      .unique();

    if (!product) {
      throw new Error("Product not found.");
    }

    const [avatars, productAvatarPreference, ownerAvatarPreference, demoClips] =
      await Promise.all([
        ctx.db
          .query("avatars")
          .withIndex("by_owner_created", (index) => index.eq("ownerId", ownerId))
          .order("desc")
          .take(100),
        ctx.db
          .query("avatarPreferences")
          .withIndex("by_owner_product", (index) =>
            index.eq("ownerId", ownerId).eq("productId", normalizedProductId),
          )
          .unique(),
        ctx.db
          .query("avatarPreferences")
          .withIndex("by_owner_product", (index) =>
            index.eq("ownerId", ownerId).eq("productId", undefined),
          )
          .unique(),
        ctx.db
          .query("videoClipCards")
          .withIndex("by_owner_created", (index) => index.eq("ownerId", ownerId))
          .order("desc")
          .take(200),
      ]);
    const availableAvatars = avatars.filter(
      (avatar) => !avatar.productId || avatar.productId === normalizedProductId,
    );
    const availableDemos = demoClips.filter(
      (clip) =>
        clip.clipType === "demo" &&
        (!clip.productId || clip.productId === normalizedProductId),
    );
    const preferredAvatarId =
      product.defaultAvatarId ??
      productAvatarPreference?.defaultAvatarId ??
      ownerAvatarPreference?.defaultAvatarId;
    const defaultAvatarId = availableAvatars.some(
      (avatar) => avatar.id === preferredAvatarId,
    )
      ? preferredAvatarId
      : undefined;
    const defaultDemoClipId = availableDemos.some(
      (clip) => clip.id === product.defaultDemoClipId,
    )
      ? product.defaultDemoClipId
      : undefined;

    return {
      avatars: availableAvatars.map((avatar) => ({
        id: avatar.id,
        name: avatar.name,
      })),
      defaultAvatarId,
      defaultDemoClipId,
      demoClips: availableDemos.map((clip) => ({
        id: clip.id,
        name: clip.name,
      })),
    };
  },
});
