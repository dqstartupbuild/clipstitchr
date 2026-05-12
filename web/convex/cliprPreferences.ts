import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("cliprUserPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const setDefaultVoice = mutation({
  args: {
    defaultVoiceId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { defaultVoiceId, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const existingPreference = await ctx.db
      .query("cliprUserPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (existingPreference) {
      await ctx.db.patch(existingPreference._id, {
        defaultVoiceId,
        updatedAt,
      });
      return existingPreference._id;
    }

    return await ctx.db.insert("cliprUserPreferences", {
      ownerId,
      defaultVoiceId,
      updatedAt,
    });
  },
});
