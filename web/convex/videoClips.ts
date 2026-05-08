import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { assetTagsValidator } from "./validators/assetTags";
import { clipTypeValidator } from "./validators/clipType";
import { r2ObjectValidator } from "./validators/r2Object";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";

const saveArgs = {
  id: v.string(),
  name: v.string(),
  tags: assetTagsValidator,
  originalName: v.string(),
  clipType: clipTypeValidator,
  videoObject: r2ObjectValidator,
  posterObject: v.optional(r2ObjectValidator),
  posterVersion: v.optional(v.number()),
  mimeType: v.string(),
  sourceMimeType: v.string(),
  size: v.number(),
  originalSize: v.number(),
  width: v.number(),
  height: v.number(),
  aspectRatio: v.number(),
  duration: v.number(),
  defaultTrimRange: v.optional(videoTrimRangeValidator),
  hasAudio: v.boolean(),
  swaprMetadata: v.optional(swaprMetadataValidator),
  createdAt: v.string(),
  updatedAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("videoClips")
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
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const clip = {
      ownerId,
      ...args,
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      return existingClip._id;
    }

    return await ctx.db.insert("videoClips", clip);
  },
});

export const updateMetadata = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    tags: v.optional(assetTagsValidator),
    defaultTrimRange: v.optional(videoTrimRangeValidator),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, name, tags, defaultTrimRange, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      throw new Error("Video clip not found.");
    }

    await ctx.db.patch(clip._id, {
      ...(name === undefined ? {} : { name }),
      ...(tags === undefined ? {} : { tags }),
      ...(defaultTrimRange === undefined ? {} : { defaultTrimRange }),
      updatedAt,
    });
  },
});

export const updatePoster = mutation({
  args: {
    id: v.string(),
    posterObject: r2ObjectValidator,
    posterVersion: v.number(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, posterObject, posterVersion, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      throw new Error("Video clip not found.");
    }

    await ctx.db.patch(clip._id, {
      posterObject,
      posterVersion,
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
    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      return null;
    }

    await ctx.db.delete(clip._id);
    return clip;
  },
});
