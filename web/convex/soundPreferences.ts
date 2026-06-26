import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { soundRightsAgreementVersion } from "../lib/clipstitchr/constants/soundRightsAgreementVersion";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("soundPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const acceptRights = mutation({
  args: {
    acceptedAt: v.string(),
  },
  handler: async (ctx, { acceptedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existing = await ctx.db
      .query("soundPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const nextPreference = {
      ownerId,
      rightsAcceptedAt: acceptedAt,
      rightsAgreementVersion: soundRightsAgreementVersion,
      updatedAt: acceptedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextPreference);

      return existing._id;
    }

    return await ctx.db.insert("soundPreferences", nextPreference);
  },
});
