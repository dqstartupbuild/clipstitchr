import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { stitchCounts } from "./aggregateCounts";
import { rateLimiter } from "./rateLimiter";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { librarySortOrderValidator } from "./validators/librarySortOrder";
import { r2ObjectValidator } from "./validators/r2Object";
import { stitchrModeValidator } from "./validators/stitchrMode";
import { stitchSequenceSegmentValidator } from "./validators/stitchSequenceSegment";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
import {
  textOverlayValidator,
  textOverlaysValidator,
} from "./validators/textOverlay";
import { videoPlaybackRateValidator } from "./validators/videoPlaybackRate";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";

const saveArgs = {
  id: v.string(),
  mode: v.optional(stitchrModeValidator),
  name: v.string(),
  ugcClipId: v.string(),
  demoClipId: v.string(),
  ugcClipName: v.string(),
  demoClipName: v.string(),
  ugcTrimRange: v.optional(videoTrimRangeValidator),
  demoTrimRange: v.optional(videoTrimRangeValidator),
  sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
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
  demoPlaybackRate: v.optional(videoPlaybackRateValidator),
  ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
  music: v.optional(stitchMusicMetadataValidator),
  textOverlay: v.optional(textOverlayValidator),
  textOverlays: v.optional(textOverlaysValidator),
  createdAt: v.string(),
};

const saveFromAutomationArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: automationProvenanceValidator,
  ...saveArgs,
};

const postedStatusValidator = v.union(
  v.literal("active"),
  v.literal("all"),
  v.literal("posted"),
);

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    postedStatus: v.optional(postedStatusValidator),
    refreshNonce: v.optional(v.number()),
    sortOrder: v.optional(librarySortOrderValidator),
  },
  handler: async (ctx, { paginationOpts, postedStatus = "all", sortOrder }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (postedStatus === "active") {
      return await ctx.db
        .query("stitches")
        .withIndex("by_owner_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", undefined),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(paginationOpts);
    }

    if (postedStatus === "posted") {
      return await ctx.db
        .query("stitches")
        .withIndex("by_owner_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", true),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(paginationOpts);
    }

    return await ctx.db
      .query("stitches")
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
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch);
      }

      return existingStitch._id;
    }

    const stitchId = await ctx.db.insert("stitches", stitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await stitchCounts.insertIfDoesNotExist(ctx, insertedStitch);
    }

    return stitchId;
  },
});

export const saveFromAutomation = mutation({
  args: saveFromAutomationArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertAutomationWorkerSecret(secret);

    const ugcClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.ugcClipId),
      )
      .unique();
    const demoClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.demoClipId),
      )
      .unique();

    if (!ugcClip || !demoClip) {
      throw new Error("Automation Stitchr source clips were not found.");
    }

    const existingStitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (
      existingStitch?.automation?.source === "automation" &&
      existingStitch.automation.taskId === automation.taskId
    ) {
      return existingStitch._id;
    }

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    const stitch = {
      ownerId,
      ...args,
      automation,
    };

    if (existingStitch) {
      await ctx.db.patch(existingStitch._id, stitch);
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch);
      }

      return existingStitch._id;
    }

    const stitchId = await ctx.db.insert("stitches", stitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await stitchCounts.insertIfDoesNotExist(ctx, insertedStitch);
    }

    return stitchId;
  },
});

export const saveFromMediaWorker = mutation({
  args: saveFromAutomationArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertMediaWorkerSecret(secret);

    const ugcClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.ugcClipId),
      )
      .unique();
    const demoClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.demoClipId),
      )
      .unique();

    if (!ugcClip || !demoClip) {
      throw new Error("Automation Stitchr source clips were not found.");
    }

    const existingStitch = await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (
      existingStitch?.automation?.source === "automation" &&
      existingStitch.automation.taskId === automation.taskId
    ) {
      return existingStitch._id;
    }

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    const stitch = {
      ownerId,
      ...args,
      automation,
    };

    if (existingStitch) {
      await ctx.db.patch(existingStitch._id, stitch);
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch);
      }

      return existingStitch._id;
    }

    const stitchId = await ctx.db.insert("stitches", stitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await stitchCounts.insertIfDoesNotExist(ctx, insertedStitch);
    }

    return stitchId;
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
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
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
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
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
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
  },
});

export const updateSourceSettings = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: videoTrimRangeValidator,
    demoTrimRange: videoTrimRangeValidator,
    duration: v.number(),
    ugcPlaybackRate: videoPlaybackRateValidator,
    demoPlaybackRate: videoPlaybackRateValidator,
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      id,
      name,
      ugcClipId,
      demoClipId,
      ugcTrimRange,
      demoTrimRange,
      duration,
      ugcPlaybackRate,
      demoPlaybackRate,
      posterObject,
      posterVersion,
    },
  ) => {
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

    if (stitch.mode === "longr" && stitch.sequenceSegments?.length) {
      throw new Error("Longr stitches do not support UGC and demo source edits.");
    }

    const [ugcClip, demoClip] = await Promise.all([
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", ugcClipId),
        )
        .unique(),
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", demoClipId),
        )
        .unique(),
    ]);

    if (!ugcClip || ugcClip.clipType !== "ugc") {
      throw new Error("UGC source clip not found.");
    }

    if (!demoClip || demoClip.clipType !== "demo") {
      throw new Error("Demo source clip not found.");
    }

    await ctx.db.patch(stitch._id, {
      demoClipId,
      demoClipName: demoClip.name,
      demoPlaybackRate,
      demoTrimRange,
      duration,
      mimeType: undefined,
      name,
      posterObject: posterObject ?? undefined,
      posterVersion: posterObject ? posterVersion : undefined,
      size: undefined,
      stitchObject: undefined,
      ugcClipId,
      ugcClipName: ugcClip.name,
      ugcPlaybackRate,
      ugcTrimRange,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
  },
});

export const updateTextOverlay = mutation({
  args: {
    id: v.string(),
    textOverlay: v.optional(v.union(textOverlayValidator, v.null())),
    textOverlays: v.optional(textOverlaysValidator),
  },
  handler: async (ctx, { id, textOverlay, textOverlays }) => {
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

    const normalizedTextOverlays =
      textOverlays ??
      (textOverlay && textOverlay.text.trim().length > 0 ? [textOverlay] : []);

    await ctx.db.patch(stitch._id, {
      textOverlay: normalizedTextOverlays[0],
      textOverlays: normalizedTextOverlays.length
        ? normalizedTextOverlays
        : undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
  },
});

export const updatePostedStatus = mutation({
  args: {
    id: v.string(),
    isPosted: v.boolean(),
  },
  handler: async (ctx, { id, isPosted }) => {
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
      isPosted: isPosted ? true : undefined,
      postedAt: isPosted ? new Date().toISOString() : undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch);
    }
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
    await stitchCounts.deleteIfExists(ctx, stitch);
    return stitch;
  },
});
