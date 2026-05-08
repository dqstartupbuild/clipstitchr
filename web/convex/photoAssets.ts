import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { assetTagsValidator } from "./validators/assetTags";
import { r2ObjectValidator } from "./validators/r2Object";

const preparationValidator = v.union(
  v.literal("ai-outpaint"),
  v.literal("original-portrait"),
  v.literal("auto-crop"),
);

const saveArgs = {
  id: v.string(),
  name: v.string(),
  tags: assetTagsValidator,
  originalName: v.string(),
  photoObject: r2ObjectValidator,
  originalObject: v.optional(r2ObjectValidator),
  thumbnailObject: v.optional(r2ObjectValidator),
  mimeType: v.string(),
  originalMimeType: v.optional(v.string()),
  size: v.number(),
  originalSize: v.optional(v.number()),
  width: v.number(),
  height: v.number(),
  originalWidth: v.optional(v.number()),
  originalHeight: v.optional(v.number()),
  preparation: v.optional(preparationValidator),
  consentAcknowledgedAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingPhoto = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const photo = {
      ownerId,
      ...args,
    };

    if (existingPhoto) {
      await ctx.db.patch(existingPhoto._id, photo);
      return existingPhoto._id;
    }

    return await ctx.db.insert("photoAssets", photo);
  },
});

export const updateMetadata = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, name, tags, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const photo = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!photo) {
      throw new Error("Photo not found.");
    }

    await ctx.db.patch(photo._id, {
      name,
      tags,
      updatedAt,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const photo = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!photo) {
      return null;
    }

    await ctx.db.delete(photo._id);
    return photo;
  },
});
