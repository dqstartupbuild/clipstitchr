import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("avatars")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const existingAvatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const avatar = {
      ownerId,
      ...args,
    };

    if (existingAvatar) {
      await ctx.db.patch(existingAvatar._id, avatar);
      return existingAvatar._id;
    }

    return await ctx.db.insert("avatars", avatar);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, name, description, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!avatar) {
      throw new Error("Avatar not found.");
    }

    await ctx.db.patch(avatar._id, {
      name,
      ...(description === undefined ? {} : { description }),
      updatedAt,
    });
  },
});
