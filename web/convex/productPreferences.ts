import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const setDefaultProduct = mutation({
  args: {
    productId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { productId, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", productId),
      )
      .unique();

    if (!product) {
      throw new Error("Product not found.");
    }

    const existing = await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const preferences = {
      ownerId,
      defaultProductId: product.id,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, preferences);
      return existing._id;
    }

    return await ctx.db.insert("productPreferences", preferences);
  },
});

export const completeOnboarding = mutation({
  args: {
    completedAt: v.string(),
  },
  handler: async (ctx, { completedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const existing = await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const preferences = {
      ownerId,
      onboardingCompletedAt: completedAt,
      updatedAt: completedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, preferences);
      return existing._id;
    }

    return await ctx.db.insert("productPreferences", preferences);
  },
});
