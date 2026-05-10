import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

const SETTING_TEXT_MAX_LENGTH = 2000;

function normalizeSettingText(value: string) {
  return value.trim().slice(0, SETTING_TEXT_MAX_LENGTH);
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("workspaceSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const save = mutation({
  args: {
    productDetails: v.string(),
    audienceDetails: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { productDetails, audienceDetails, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const existingSettings = await ctx.db
      .query("workspaceSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const settings = {
      ownerId,
      productDetails: normalizeSettingText(productDetails),
      audienceDetails: normalizeSettingText(audienceDetails),
      updatedAt,
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settings);
      return existingSettings._id;
    }

    return await ctx.db.insert("workspaceSettings", {
      ...settings,
      createdAt: updatedAt,
    });
  },
});
