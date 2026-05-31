import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { videoClipCounts } from "./aggregateCounts";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { cliprMetadataValidator } from "./validators/cliprMetadata";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { clipTypeValidator } from "./validators/clipType";
import { librarySortOrderValidator } from "./validators/librarySortOrder";
import { r2ObjectValidator } from "./validators/r2Object";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { videoClipLibraryKindValidator } from "./validators/videoClipLibraryKind";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";

const saveArgs = {
  id: v.string(),
  name: v.string(),
  tags: assetTagsValidator,
  videoDescription: v.optional(v.string()),
  mainPersonDescription: v.optional(v.string()),
  outfitDescription: v.optional(v.string()),
  locationDescription: v.optional(v.string()),
  poseDescription: v.optional(v.string()),
  productDescription: v.optional(v.string()),
  productId: v.optional(v.string()),
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
  cliprMetadata: v.optional(cliprMetadataValidator),
  createdAt: v.string(),
  updatedAt: v.string(),
};

const saveFromAutomationArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: automationProvenanceValidator,
  ...saveArgs,
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
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order(sortOrder === "oldest" ? "asc" : "desc")
      .paginate(paginationOpts);
  },
});

export const listByLibraryKind = query({
  args: {
    kind: videoClipLibraryKindValidator,
    paginationOpts: paginationOptsValidator,
    refreshNonce: v.optional(v.number()),
    sortOrder: v.optional(librarySortOrderValidator),
  },
  handler: async (ctx, { kind, paginationOpts, sortOrder }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const clips = ctx.db
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order(sortOrder === "oldest" ? "asc" : "desc");

    const filteredClips =
      kind === "clipr"
        ? clips.filter((q) => q.neq(q.field("cliprMetadata"), undefined))
        : kind === "swapr"
          ? clips.filter((q) => q.neq(q.field("swaprMetadata"), undefined))
          : kind === "demo"
            ? clips.filter((q) => q.eq(q.field("clipType"), "demo"))
            : clips.filter((q) =>
                q.and(
                  q.eq(q.field("clipType"), "ugc"),
                  q.eq(q.field("cliprMetadata"), undefined),
                  q.eq(q.field("swaprMetadata"), undefined),
                ),
              );

    return await filteredClips.paginate(paginationOpts);
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

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    let demoProductId: string | undefined;

    if (args.clipType === "demo") {
      const requestedProductId = args.productId?.trim();

      if (!requestedProductId) {
        throw new Error("Choose a product before saving a demo video.");
      }

      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", requestedProductId),
        )
        .unique();

      if (!product) {
        throw new Error("Product not found.");
      }

      demoProductId = requestedProductId;
    }

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const clipArgs = { ...args };

    delete clipArgs.productId;

    const clip = {
      ownerId,
      ...clipArgs,
      ...(demoProductId ? { productId: demoProductId } : {}),
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip);
      }

      return existingClip._id;
    }

    const clipId = await ctx.db.insert("videoClips", clip);
    const insertedClip = await ctx.db.get(clipId);

    if (insertedClip) {
      await videoClipCounts.insertIfDoesNotExist(ctx, insertedClip);
    }

    return clipId;
  },
});

export const saveFromAutomation = mutation({
  args: saveFromAutomationArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertAutomationWorkerSecret(secret);

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (
      existingClip?.automation?.source === "automation" &&
      existingClip.automation.taskId === automation.taskId
    ) {
      return existingClip._id;
    }

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    const clip = {
      ownerId,
      ...args,
      automation,
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip);
      }

      return existingClip._id;
    }

    const clipId = await ctx.db.insert("videoClips", clip);
    const insertedClip = await ctx.db.get(clipId);

    if (insertedClip) {
      await videoClipCounts.insertIfDoesNotExist(ctx, insertedClip);
    }

    return clipId;
  },
});

export const updateMetadata = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    tags: v.optional(assetTagsValidator),
    videoDescription: v.optional(v.string()),
    mainPersonDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    productDescription: v.optional(v.string()),
    productId: v.optional(v.string()),
    defaultTrimRange: v.optional(videoTrimRangeValidator),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      id,
      name,
      tags,
      videoDescription,
      mainPersonDescription,
      outfitDescription,
      locationDescription,
      poseDescription,
      productDescription,
      productId,
      defaultTrimRange,
      updatedAt,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      throw new Error("Video clip not found.");
    }

    let demoProductId: string | undefined;

    if (productId !== undefined) {
      if (clip.clipType !== "demo") {
        throw new Error("Only demo videos can be linked to products.");
      }

      const requestedProductId = productId.trim();

      if (!requestedProductId) {
        throw new Error("Choose a product before saving a demo video.");
      }

      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", requestedProductId),
        )
        .unique();

      if (!product) {
        throw new Error("Product not found.");
      }

      demoProductId = requestedProductId;
    }

    await ctx.db.patch(clip._id, {
      ...(name === undefined ? {} : { name }),
      ...(tags === undefined ? {} : { tags }),
      ...(videoDescription === undefined ? {} : { videoDescription }),
      ...(mainPersonDescription === undefined ? {} : { mainPersonDescription }),
      ...(outfitDescription === undefined ? {} : { outfitDescription }),
      ...(locationDescription === undefined ? {} : { locationDescription }),
      ...(poseDescription === undefined ? {} : { poseDescription }),
      ...(productDescription === undefined ? {} : { productDescription }),
      ...(demoProductId === undefined ? {} : { productId: demoProductId }),
      ...(defaultTrimRange === undefined ? {} : { defaultTrimRange }),
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await videoClipCounts.replaceOrInsert(ctx, clip, updatedClip);
    }
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

    await rateLimiter.limit(ctx, "convexPosterUpdate", {
      key: ownerId,
      throws: true,
    });

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
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await videoClipCounts.replaceOrInsert(ctx, clip, updatedClip);
    }
  },
});

export const updateCliprMusic = mutation({
  args: {
    id: v.string(),
    music: v.union(cliprMusicMetadataValidator, v.null()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, music, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip?.cliprMetadata) {
      throw new Error("Clipr clip not found.");
    }

    const cliprMetadata = { ...clip.cliprMetadata };

    delete cliprMetadata.music;

    await ctx.db.patch(clip._id, {
      cliprMetadata:
        music === null
          ? cliprMetadata
          : {
              ...cliprMetadata,
              music,
              providerModels: Array.from(
                new Set([...cliprMetadata.providerModels, music.providerModel]),
              ),
            },
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await videoClipCounts.replaceOrInsert(ctx, clip, updatedClip);
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

    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      return null;
    }

    await ctx.db.delete(clip._id);
    await videoClipCounts.deleteIfExists(ctx, clip);
    return clip;
  },
});
