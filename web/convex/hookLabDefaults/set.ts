import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const set = mutation({
  args: {
    defaultAvatarId: v.optional(v.string()),
    defaultDemoClipId: v.optional(v.string()),
    productId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { defaultAvatarId, defaultDemoClipId, productId, updatedAt },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

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

    const normalizedAvatarId = defaultAvatarId?.trim() || undefined;
    const normalizedDemoClipId = defaultDemoClipId?.trim() || undefined;
    const [avatar, demoClip] = await Promise.all([
      normalizedAvatarId
        ? ctx.db
            .query("avatars")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", ownerId).eq("id", normalizedAvatarId),
            )
            .unique()
        : Promise.resolve(null),
      normalizedDemoClipId
        ? ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", ownerId).eq("id", normalizedDemoClipId),
            )
            .unique()
        : Promise.resolve(null),
    ]);

    if (
      normalizedAvatarId &&
      (!avatar || (avatar.productId && avatar.productId !== normalizedProductId))
    ) {
      throw new Error("Choose an avatar for this product.");
    }

    if (
      normalizedDemoClipId &&
      (!demoClip ||
        demoClip.clipType !== "demo" ||
        (demoClip.productId && demoClip.productId !== normalizedProductId))
    ) {
      throw new Error("Choose a Demo clip for this product.");
    }

    await ctx.db.patch(product._id, {
      ...(normalizedAvatarId ? { defaultAvatarId: normalizedAvatarId } : {}),
      ...(normalizedDemoClipId
        ? { defaultDemoClipId: normalizedDemoClipId }
        : {}),
      updatedAt,
    });

    if (normalizedAvatarId) {
      const preferences = await ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner_product", (index) =>
          index.eq("ownerId", ownerId).eq("productId", normalizedProductId),
        )
        .unique();
      const fields = {
        defaultAvatarId: normalizedAvatarId,
        ownerId,
        productId: normalizedProductId,
        updatedAt,
      };

      if (preferences) {
        await ctx.db.patch(preferences._id, fields);
      } else {
        await ctx.db.insert("avatarPreferences", fields);
      }
    }

    return product.id;
  },
});
