import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { longrVideoCounts } from "./aggregateCounts";
import { rateLimiter } from "./rateLimiter";
import { librarySortOrderValidator } from "./validators/librarySortOrder";
import { longrClipSegmentValidator } from "./validators/longrClipSegment";
import { longrMusicClipValidator } from "./validators/longrMusicClip";
import { r2ObjectValidator } from "./validators/r2Object";

const LONGR_MAX_DURATION_SECONDS = 300;
const LONGR_DURATION_GRACE_SECONDS = 0.5;

const saveArgs = {
  id: v.string(),
  name: v.string(),
  clipSegments: v.array(longrClipSegmentValidator),
  musicClips: v.optional(v.array(longrMusicClipValidator)),
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
  args: {
    paginationOpts: paginationOptsValidator,
    refreshNonce: v.optional(v.number()),
    sortOrder: v.optional(librarySortOrderValidator),
  },
  handler: async (ctx, { paginationOpts, sortOrder }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("longrVideos")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order(sortOrder === "oldest" ? "asc" : "desc")
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
      const updatedLongrVideo = await ctx.db.get(existingLongrVideo._id);

      if (updatedLongrVideo) {
        await longrVideoCounts.replaceOrInsert(
          ctx,
          existingLongrVideo,
          updatedLongrVideo,
        );
      }

      return existingLongrVideo._id;
    }

    const longrVideoId = await ctx.db.insert("longrVideos", longrVideo);
    const insertedLongrVideo = await ctx.db.get(longrVideoId);

    if (insertedLongrVideo) {
      await longrVideoCounts.insertIfDoesNotExist(ctx, insertedLongrVideo);
    }

    return longrVideoId;
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
    await longrVideoCounts.deleteIfExists(ctx, longrVideo);
    return longrVideo;
  },
});
