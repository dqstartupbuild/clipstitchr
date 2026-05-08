import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { r2ObjectValidator } from "./validators/r2Object";
import { textOverlayValidator } from "./validators/textOverlay";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";

const saveArgs = {
  id: v.string(),
  name: v.string(),
  ugcClipId: v.string(),
  demoClipId: v.string(),
  ugcClipName: v.string(),
  demoClipName: v.string(),
  ugcTrimRange: v.optional(videoTrimRangeValidator),
  demoTrimRange: v.optional(videoTrimRangeValidator),
  stitchObject: r2ObjectValidator,
  posterObject: v.optional(r2ObjectValidator),
  posterVersion: v.optional(v.number()),
  mimeType: v.string(),
  size: v.number(),
  width: v.number(),
  height: v.number(),
  duration: v.number(),
  textOverlay: v.optional(textOverlayValidator),
  createdAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("stitches")
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
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingStitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const stitch = {
      ownerId,
      ...args,
    };

    if (existingStitch) {
      await ctx.db.patch(existingStitch._id, stitch);
      return existingStitch._id;
    }

    return await ctx.db.insert("stitches", stitch);
  },
});

export const updatePoster = mutation({
  args: {
    id: v.string(),
    posterObject: r2ObjectValidator,
    posterVersion: v.number(),
  },
  handler: async (ctx, { id, posterObject, posterVersion }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await ctx.db.patch(stitch._id, {
      posterObject,
      posterVersion,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      return null;
    }

    await ctx.db.delete(stitch._id);
    return stitch;
  },
});
