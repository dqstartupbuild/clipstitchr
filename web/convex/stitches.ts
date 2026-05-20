import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { r2ObjectValidator } from "./validators/r2Object";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
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
  stitchObject: v.optional(r2ObjectValidator),
  posterObject: v.optional(r2ObjectValidator),
  posterVersion: v.optional(v.number()),
  mimeType: v.optional(v.string()),
  size: v.optional(v.number()),
  width: v.number(),
  height: v.number(),
  duration: v.number(),
  includeDemoAudio: v.optional(v.boolean()),
  includeUgcAudio: v.optional(v.boolean()),
  music: v.optional(stitchMusicMetadataValidator),
  textOverlay: v.optional(textOverlayValidator),
  createdAt: v.string(),
};

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    refreshNonce: v.optional(v.number()),
  },
  handler: async (ctx, { paginationOpts }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("stitches")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .paginate(paginationOpts);
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

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

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

    await rateLimiter.limit(ctx, "convexPosterUpdate", {
      key: ownerId,
      throws: true,
    });

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

export const updateRenderedVideo = mutation({
  args: {
    id: v.string(),
    mimeType: v.string(),
    size: v.number(),
    stitchObject: r2ObjectValidator,
  },
  handler: async (ctx, { id, mimeType, size, stitchObject }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await ctx.db.patch(stitch._id, {
      mimeType,
      size,
      stitchObject,
    });
  },
});

export const updateMusic = mutation({
  args: {
    id: v.string(),
    music: v.union(stitchMusicMetadataValidator, v.null()),
  },
  handler: async (ctx, { id, music }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await ctx.db.patch(stitch._id, {
      music: music ?? undefined,
    });
  },
});

export const updateTextOverlay = mutation({
  args: {
    id: v.string(),
    textOverlay: v.union(textOverlayValidator, v.null()),
  },
  handler: async (ctx, { id, textOverlay }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const stitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await ctx.db.patch(stitch._id, {
      textOverlay: textOverlay ?? undefined,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

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
