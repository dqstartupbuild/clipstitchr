import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const get = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId) {
      const productPreferences = await ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner_product", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productId),
        )
        .unique();

      if (productPreferences) {
        return productPreferences;
      }
    }

    return await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("productId"), undefined))
      .first();
  },
});

export const setDefaultAvatar = mutation({
  args: {
    avatarId: v.string(),
    productId: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { avatarId, productId, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", avatarId),
      )
      .unique();

    if (!avatar) {
      throw new Error("Avatar not found.");
    }

    if (productId && avatar.productId !== productId) {
      throw new Error("Avatar not found for this product.");
    }

    const existing = await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", productId),
      )
      .unique();
    const preferences = {
      ownerId,
      productId,
      defaultAvatarId: avatar.id,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, preferences);
      return existing._id;
    }

    return await ctx.db.insert("avatarPreferences", preferences);
  },
});
