import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { longrClipSegmentValidator } from "./validators/longrClipSegment";
import { r2ObjectValidator } from "./validators/r2Object";

const LONGR_MAX_DURATION_SECONDS = 300;
const LONGR_DURATION_GRACE_SECONDS = 0.5;

const saveArgs = {
  id: v.string(),
  name: v.string(),
  clipSegments: v.array(longrClipSegmentValidator),
  longrObject: r2ObjectValidator,
  posterObject: v.optional(r2ObjectValidator),
  posterVersion: v.optional(v.number()),
  mimeType: v.string(),
  size: v.number(),
  width: v.number(),
  height: v.number(),
  duration: v.number(),
  createdAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("longrVideos")
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
      .query("longrVideos")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (
      args.duration >
      LONGR_MAX_DURATION_SECONDS + LONGR_DURATION_GRACE_SECONDS
    ) {
      throw new Error("Longr videos cannot be longer than 5 minutes.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const existingLongrVideo = await ctx.db
      .query("longrVideos")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const longrVideo = {
      ownerId,
      ...args,
    };

    if (existingLongrVideo) {
      await ctx.db.patch(existingLongrVideo._id, longrVideo);
      return existingLongrVideo._id;
    }

    return await ctx.db.insert("longrVideos", longrVideo);
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

    const longrVideo = await ctx.db
      .query("longrVideos")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!longrVideo) {
      return null;
    }

    await ctx.db.delete(longrVideo._id);
    return longrVideo;
  },
});
