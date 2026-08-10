import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { deleteStitchCard } from "./deleteStitchCard";
import { getFirstStitchScoreUpdate } from "./getFirstStitchScoreUpdate";
import { getReadLimitedPaginationOpts } from "./getReadLimitedPaginationOpts";
import { getQuickEditWithRemoveRanges } from "./getQuickEditWithRemoveRanges";
import { getStitchProductId } from "./getStitchProductId";
import { getStitchNotificationCopy } from "./getStitchNotificationCopy";
import { stitchCounts, stitchProductCounts } from "./aggregateCounts";
import { normalizeQuickEditRemoveRanges } from "./normalizeQuickEditRemoveRanges";
import { rateLimiter } from "./rateLimiter";
import { upsertStitchCard } from "./upsertStitchCard";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { librarySortOrderValidator } from "./validators/librarySortOrder";
import { quickEditCropValidator } from "./validators/quickEditCrop";
import { quickEditRemoveRangeValidator } from "./validators/quickEditRemoveRange";
import { quickEditSuggestionsValidator } from "./validators/quickEditSuggestions";
import { socialPublishingPostReferenceValidator } from "./validators/socialPublishingPostReference";
import { upsertSocialPublishingPostProductMapping } from "./socialPublishingPostProductMappings";
import { r2ObjectValidator } from "./validators/r2Object";
import { stitchScoreValidator } from "./validators/stitchScore";
import { stitchrModeValidator } from "./validators/stitchrMode";
import { stitchSequenceSegmentValidator } from "./validators/stitchSequenceSegment";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";
import {
  textOverlayValidator,
  textOverlaysValidator,
} from "./validators/textOverlay";
import { videoPlaybackRateValidator } from "./validators/videoPlaybackRate";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";
import { getStitchrBatchRateLimitKey } from "../lib/clipstitchr/server/stitchr/getStitchrBatchRateLimitKey";
import { commitStitchUsageReservation } from "./usage/commitStitchUsageReservation";
import { commitUserStitchUsage } from "./usage/commitUserStitchUsage";

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
  demoQuickEdit: v.optional(quickEditSuggestionsValidator),
  ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
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
  socialCaption: v.optional(v.string()),
  usageIdempotencyKey: v.optional(v.string()),
  usageReservationId: v.optional(v.string()),
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
    productId: v.optional(v.string()),
    postedStatus: v.optional(postedStatusValidator),
    sortOrder: v.optional(librarySortOrderValidator),
  },
  handler: async (
    ctx,
    { paginationOpts, productId, postedStatus = "all", sortOrder },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;
    const readLimitedPaginationOpts =
      getReadLimitedPaginationOpts(paginationOpts);

    if (postedStatus === "active") {
      if (productFilterId) {
        return await ctx.db
          .query("stitchCards")
          .withIndex("by_owner_product_is_posted_created", (q) =>
            q
              .eq("ownerId", ownerId)
              .eq("productId", productFilterId)
              .eq("isPosted", undefined),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts);
      }

      return await ctx.db
        .query("stitchCards")
        .withIndex("by_owner_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", undefined),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(readLimitedPaginationOpts);
    }

    if (postedStatus === "posted") {
      if (productFilterId) {
        return await ctx.db
          .query("stitchCards")
          .withIndex("by_owner_product_is_posted_created", (q) =>
            q
              .eq("ownerId", ownerId)
              .eq("productId", productFilterId)
              .eq("isPosted", true),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts);
      }

      return await ctx.db
        .query("stitchCards")
        .withIndex("by_owner_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", true),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(readLimitedPaginationOpts);
    }

    if (productFilterId) {
      return await ctx.db
        .query("stitchCards")
        .withIndex("by_owner_product_created", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productFilterId),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(readLimitedPaginationOpts);
    }

    return await ctx.db
      .query("stitchCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order(sortOrder === "oldest" ? "asc" : "desc")
      .paginate(readLimitedPaginationOpts);
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

export const getForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id }) => {
    assertProviderWorkerSecret(secret);

    return await ctx.db
      .query("stitches")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (
    ctx,
    { usageIdempotencyKey, usageReservationId, ...args },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();

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
    const productId = await getStitchProductId(ctx, ownerId, args.demoClipId);
    const stitch = {
      ownerId,
      ...args,
      productId,
    };

    if (existingStitch) {
      if (
        (usageIdempotencyKey || usageReservationId) &&
        usageReservationId !== existingStitch.usageReservationId
      ) {
        await commitUserStitchUsage(ctx, {
          now,
          ownerId,
          stitchId: args.id,
          usageIdempotencyKey,
          usageReservationId,
        });
      }

      await ctx.db.patch(existingStitch._id, stitch);
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await Promise.all([
          stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch),
          stitchProductCounts.replaceOrInsert(
            ctx,
            existingStitch,
            updatedStitch,
          ),
          upsertStitchCard(ctx, updatedStitch),
        ]);
      }

      return existingStitch._id;
    }

    const committedUsageReservationId = await commitUserStitchUsage(ctx, {
      now,
      ownerId,
      stitchId: args.id,
      usageIdempotencyKey,
      usageReservationId,
    });

    const newStitch = {
      ...stitch,
      ...(committedUsageReservationId
        ? { usageReservationId: committedUsageReservationId }
        : {}),
    };

    const stitchId = await ctx.db.insert("stitches", newStitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await Promise.all([
        stitchCounts.insertIfDoesNotExist(ctx, insertedStitch),
        stitchProductCounts.insertIfDoesNotExist(ctx, insertedStitch),
        upsertStitchCard(ctx, insertedStitch),
      ]);
    }

    const notificationCopy = getStitchNotificationCopy(args);

    await createNotification(ctx, {
      ownerId,
      productId,
      sourceType: "stitch",
      sourceId: args.id,
      dedupeKey: `stitch:${args.id}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: args.createdAt,
    });

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
      productId: demoClip.productId,
      automation,
    };

    if (existingStitch) {
      await ctx.db.patch(existingStitch._id, stitch);
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await Promise.all([
          stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch),
          stitchProductCounts.replaceOrInsert(
            ctx,
            existingStitch,
            updatedStitch,
          ),
          upsertStitchCard(ctx, updatedStitch),
        ]);
      }

      return existingStitch._id;
    }

    const stitchId = await ctx.db.insert("stitches", stitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await Promise.all([
        stitchCounts.insertIfDoesNotExist(ctx, insertedStitch),
        stitchProductCounts.insertIfDoesNotExist(ctx, insertedStitch),
        upsertStitchCard(ctx, insertedStitch),
      ]);
    }

    return stitchId;
  },
});

export const saveFromMediaWorker = mutation({
  args: saveFromAutomationArgs,
  handler: async (
    ctx,
    { secret, ownerId, automation, usageReservationId, ...args },
  ) => {
    assertMediaWorkerSecret(secret);

    const isStitchrBatchSave = getIsStitchrBatchRunId(automation.runId);

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

    if (isStitchrBatchSave && existingStitch) {
      return existingStitch._id;
    }

    if (
      !isStitchrBatchSave &&
      existingStitch?.automation?.source === "automation" &&
      existingStitch.automation.taskId === automation.taskId
    ) {
      return existingStitch._id;
    }

    if (isStitchrBatchSave) {
      await rateLimiter.limit(ctx, "stitchrBatchAssetSaveDaily", {
        key: getStitchrBatchRateLimitKey(ownerId, automation.automationDate),
        throws: true,
      });
      await rateLimiter.limit(ctx, "stitchrBatchAssetSaveGlobalDaily", {
        throws: true,
      });
    } else {
      await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
        key: ownerId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
        throws: true,
      });
    }

    const committedUsageReservationId = await commitStitchUsageReservation(
      ctx,
      ownerId,
      usageReservationId,
      args.createdAt,
      "worker",
      {
        domainId: `${automation.taskId}:stitch`,
        domainKind: "automation_task",
        operation: "stitch",
        reservationKind: "worker",
        resource: "creation_credit",
      },
    );

    const stitch = {
      ownerId,
      ...args,
      productId: demoClip.productId,
      ...(isStitchrBatchSave ? {} : { automation }),
      ...(committedUsageReservationId
        ? { usageReservationId: committedUsageReservationId }
        : {}),
    };

    if (existingStitch) {
      await ctx.db.patch(existingStitch._id, stitch);
      const updatedStitch = await ctx.db.get(existingStitch._id);

      if (updatedStitch) {
        await Promise.all([
          stitchCounts.replaceOrInsert(ctx, existingStitch, updatedStitch),
          stitchProductCounts.replaceOrInsert(
            ctx,
            existingStitch,
            updatedStitch,
          ),
          upsertStitchCard(ctx, updatedStitch),
        ]);
      }

      return existingStitch._id;
    }

    const stitchId = await ctx.db.insert("stitches", stitch);
    const insertedStitch = await ctx.db.get(stitchId);

    if (insertedStitch) {
      await Promise.all([
        stitchCounts.insertIfDoesNotExist(ctx, insertedStitch),
        stitchProductCounts.insertIfDoesNotExist(ctx, insertedStitch),
        upsertStitchCard(ctx, insertedStitch),
      ]);
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
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
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
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
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
      mimeType: undefined,
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
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
      throw new Error(
        "Longr stitches do not support UGC and demo source edits.",
      );
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
      demoQuickEdit:
        stitch.demoClipId === demoClipId ? stitch.demoQuickEdit : undefined,
      demoTrimRange,
      duration,
      mimeType: undefined,
      name,
      productId: demoClip.productId,
      posterObject: posterObject ?? undefined,
      posterVersion: posterObject ? posterVersion : undefined,
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
      ugcClipId,
      ugcClipName: ugcClip.name,
      ugcPlaybackRate,
      ugcQuickEdit:
        stitch.ugcClipId === ugcClipId ? stitch.ugcQuickEdit : undefined,
      ugcTrimRange,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

function getQuickEditWithCrop(
  quickEdit:
    | {
        trimStart?: number;
        trimEnd?: number | null;
        removeRanges: Array<{ start: number; end: number; reason?: string }>;
        overlayText?: { replaceWith: string; reason?: string };
        crop?: {
          mode: "smart-9x16";
          removeBlackBars?: boolean;
          positionX?: number;
          positionY?: number;
          scale?: number;
          reason?: string;
        };
        summary?: string;
      }
    | undefined,
  crop: {
    mode: "smart-9x16";
    removeBlackBars?: boolean;
    positionX?: number;
    positionY?: number;
    scale?: number;
    reason?: string;
  } | null,
) {
  if (crop) {
    return {
      ...quickEdit,
      crop,
      removeRanges: quickEdit?.removeRanges ?? [],
    };
  }

  if (
    !quickEdit ||
    (!quickEdit.removeRanges.length &&
      !quickEdit.overlayText &&
      !quickEdit.summary &&
      quickEdit.trimStart === undefined &&
      quickEdit.trimEnd === undefined)
  ) {
    return undefined;
  }

  const { crop: _crop, ...rest } = quickEdit;

  void _crop;

  return rest;
}

export const updateSourceCrop = mutation({
  args: {
    id: v.string(),
    crop: v.union(quickEditCropValidator, v.null()),
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
    source: v.union(v.literal("ugc"), v.literal("demo")),
  },
  handler: async (ctx, { id, crop, posterObject, posterVersion, source }) => {
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
      ...(source === "ugc"
        ? { ugcQuickEdit: getQuickEditWithCrop(stitch.ugcQuickEdit, crop) }
        : { demoQuickEdit: getQuickEditWithCrop(stitch.demoQuickEdit, crop) }),
      mimeType: undefined,
      ...(posterObject === undefined
        ? {}
        : {
            posterObject: posterObject ?? undefined,
            posterVersion: posterObject ? posterVersion : undefined,
          }),
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const updateSourceCuts = mutation({
  args: {
    id: v.string(),
    duration: v.number(),
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
    removeRanges: v.array(quickEditRemoveRangeValidator),
    source: v.union(v.literal("ugc"), v.literal("demo")),
  },
  handler: async (
    ctx,
    { id, duration, posterObject, posterVersion, removeRanges, source },
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
      throw new Error(
        "Longr stitches do not support UGC and demo source cuts.",
      );
    }

    const sourceClipId =
      source === "ugc" ? stitch.ugcClipId : stitch.demoClipId;
    const sourceClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", sourceClipId),
      )
      .unique();

    if (!sourceClip) {
      throw new Error("Source clip not found.");
    }

    const normalizedRemoveRanges = normalizeQuickEditRemoveRanges(
      removeRanges,
      sourceClip.duration,
    );
    const nextQuickEdit =
      source === "ugc"
        ? getQuickEditWithRemoveRanges(
            stitch.ugcQuickEdit,
            normalizedRemoveRanges,
          )
        : getQuickEditWithRemoveRanges(
            stitch.demoQuickEdit,
            normalizedRemoveRanges,
          );

    await ctx.db.patch(stitch._id, {
      ...(source === "ugc"
        ? { ugcQuickEdit: nextQuickEdit }
        : { demoQuickEdit: nextQuickEdit }),
      duration,
      mimeType: undefined,
      ...(posterObject === undefined
        ? {}
        : {
            posterObject: posterObject ?? undefined,
            posterVersion: posterObject ? posterVersion : undefined,
          }),
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const updateTextOverlay = mutation({
  args: {
    id: v.string(),
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
    textOverlay: v.optional(v.union(textOverlayValidator, v.null())),
    textOverlays: v.optional(textOverlaysValidator),
  },
  handler: async (
    ctx,
    { id, posterObject, posterVersion, textOverlay, textOverlays },
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

    const normalizedTextOverlays =
      textOverlays ??
      (textOverlay && textOverlay.text.trim().length > 0 ? [textOverlay] : []);

    await ctx.db.patch(stitch._id, {
      mimeType: undefined,
      ...(posterObject === undefined
        ? {}
        : {
            posterObject: posterObject ?? undefined,
            posterVersion: posterObject ? posterVersion : undefined,
          }),
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
      textOverlay: normalizedTextOverlays[0],
      textOverlays: normalizedTextOverlays.length
        ? normalizedTextOverlays
        : undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const updateScore = mutation({
  args: {
    id: v.string(),
    stitchScore: stitchScoreValidator,
  },
  handler: async (ctx, { id, stitchScore }) => {
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
      firstStitchScore: getFirstStitchScoreUpdate({ stitch, stitchScore }),
      stitchScore,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const updateScoreFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    stitchScore: stitchScoreValidator,
  },
  handler: async (ctx, { secret, ownerId, id, stitchScore }) => {
    assertProviderWorkerSecret(secret);

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
      firstStitchScore: getFirstStitchScoreUpdate({ stitch, stitchScore }),
      stitchScore,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const applyQuickEdit = mutation({
  args: {
    id: v.string(),
    demoQuickEdit: v.optional(quickEditSuggestionsValidator),
    demoTrimRange: videoTrimRangeValidator,
    duration: v.number(),
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
    quickEdit: quickEditSuggestionsValidator,
    textOverlay: v.optional(v.union(textOverlayValidator, v.null())),
    textOverlays: v.optional(textOverlaysValidator),
    ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
    ugcTrimRange: videoTrimRangeValidator,
  },
  handler: async (
    ctx,
    {
      id,
      demoQuickEdit,
      demoTrimRange,
      duration,
      posterObject,
      posterVersion,
      quickEdit,
      textOverlay,
      textOverlays,
      ugcQuickEdit,
      ugcTrimRange,
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

    const normalizedTextOverlays =
      textOverlays ??
      (textOverlay && textOverlay.text.trim().length > 0 ? [textOverlay] : []);
    const appliedAt = new Date().toISOString();

    await ctx.db.patch(stitch._id, {
      demoQuickEdit,
      demoTrimRange,
      duration,
      mimeType: undefined,
      ...(posterObject === undefined
        ? {}
        : {
            posterObject: posterObject ?? undefined,
            posterVersion: posterObject ? posterVersion : undefined,
          }),
      quickEdit: {
        ...quickEdit,
        appliedAt,
        baseline: {
          ...(stitch.demoQuickEdit
            ? { demoQuickEdit: stitch.demoQuickEdit }
            : {}),
          ...(stitch.demoTrimRange
            ? { demoTrimRange: stitch.demoTrimRange }
            : {}),
          duration: stitch.duration,
          ...(stitch.textOverlay ? { textOverlay: stitch.textOverlay } : {}),
          ...(stitch.textOverlays ? { textOverlays: stitch.textOverlays } : {}),
          ...(stitch.ugcQuickEdit ? { ugcQuickEdit: stitch.ugcQuickEdit } : {}),
          ...(stitch.ugcTrimRange ? { ugcTrimRange: stitch.ugcTrimRange } : {}),
        },
        source: "ai-score",
      },
      size: undefined,
      stitchObject: undefined,
      textOverlay: normalizedTextOverlays[0],
      textOverlays: normalizedTextOverlays.length
        ? normalizedTextOverlays
        : undefined,
      ugcQuickEdit,
      ugcTrimRange,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const resetQuickEdit = mutation({
  args: {
    id: v.string(),
    posterObject: v.optional(v.union(r2ObjectValidator, v.null())),
    posterVersion: v.optional(v.number()),
  },
  handler: async (ctx, { id, posterObject, posterVersion }) => {
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

    const baseline = stitch.quickEdit?.baseline;

    await ctx.db.patch(stitch._id, {
      demoQuickEdit: baseline?.demoQuickEdit,
      demoTrimRange: baseline?.demoTrimRange,
      duration: baseline?.duration ?? stitch.duration,
      mimeType: undefined,
      ...(posterObject === undefined
        ? {}
        : {
            posterObject: posterObject ?? undefined,
            posterVersion: posterObject ? posterVersion : undefined,
          }),
      quickEdit: undefined,
      size: undefined,
      stitchObject: undefined,
      textOverlay: baseline?.textOverlay,
      textOverlays: baseline?.textOverlays,
      ugcQuickEdit: baseline?.ugcQuickEdit,
      ugcTrimRange: baseline?.ugcTrimRange,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const updateSocialCaption = mutation({
  args: {
    id: v.string(),
    socialCaption: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { id, socialCaption }) => {
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
      socialCaption: socialCaption?.trim() || undefined,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await upsertStitchCard(ctx, updatedStitch);
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
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertStitchCard(ctx, updatedStitch),
      ]);
    }
  },
});

export const addSocialPublishingPost = mutation({
  args: {
    id: v.string(),
    post: socialPublishingPostReferenceValidator,
  },
  handler: async (ctx, { id, post }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const postedAt = new Date().toISOString();

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
      isPosted: true,
      socialPublishingPosts: [
        ...(stitch.socialPublishingPosts ?? []).filter(
          (existingPost) => existingPost.postId !== post.postId,
        ),
        post,
      ],
      postedAt: stitch.postedAt ?? postedAt,
    });
    const updatedStitch = await ctx.db.get(stitch._id);

    if (updatedStitch) {
      await Promise.all([
        stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
        upsertSocialPublishingPostProductMapping(ctx, {
          ownerId,
          post,
          productId: updatedStitch.productId,
          sourceId: updatedStitch.id,
          sourceType: "stitch",
        }),
        upsertStitchCard(ctx, updatedStitch),
      ]);
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
    await Promise.all([
      stitchCounts.deleteIfExists(ctx, stitch),
      stitchProductCounts.deleteIfExists(ctx, stitch),
      deleteStitchCard(ctx, stitch),
    ]);
    return stitch;
  },
});
