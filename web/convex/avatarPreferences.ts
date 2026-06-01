import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const setDefaultAvatar = mutation({
  args: {
    avatarId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { avatarId, updatedAt }) => {
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

    const existing = await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const preferences = {
      ownerId,
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
