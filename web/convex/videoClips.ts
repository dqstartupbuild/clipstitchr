import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertProductBelongsToOwner } from "./assertProductBelongsToOwner";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { getReadLimitedPaginationOpts } from "./getReadLimitedPaginationOpts";
import { videoClipCounts, videoClipProductCounts } from "./aggregateCounts";
import { logConvexTransactionMetrics } from "./logConvexTransactionMetrics";
import { getVideoClipCanBePosted } from "./getVideoClipCanBePosted";
import { getVideoClipLibraryKind } from "./getVideoClipLibraryKind";
import { getVideoClipNotificationCopy } from "./getVideoClipNotificationCopy";
import { getRequiredVideoClipProductId } from "./getRequiredVideoClipProductId";
import { getQuickEditWithRemoveRanges } from "./getQuickEditWithRemoveRanges";
import { normalizeQuickEditRemoveRanges } from "./normalizeQuickEditRemoveRanges";
import { rateLimiter } from "./rateLimiter";
import { deleteVideoClipCard } from "./deleteVideoClipCard";
import { upsertVideoClipCard } from "./upsertVideoClipCard";
import { assetTagsValidator } from "./validators/assetTags";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { cliprMetadataValidator } from "./validators/cliprMetadata";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { clipPerformanceScoreValidator } from "./validators/clipPerformanceScore";
import { clipTypeValidator } from "./validators/clipType";
import { librarySortOrderValidator } from "./validators/librarySortOrder";
import { quickEditCropValidator } from "./validators/quickEditCrop";
import { quickEditRemoveRangeValidator } from "./validators/quickEditRemoveRange";
import { quickEditSuggestionsValidator } from "./validators/quickEditSuggestions";
import { r2ObjectValidator } from "./validators/r2Object";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { commitUsageReservationForOwner } from "./usage/commitUsageReservation";
import { reacquireUsageReservation } from "./usage/reacquireUsageReservation";
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
  performanceScore: v.optional(clipPerformanceScoreValidator),
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

const saveFromMediaWorkerArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: v.optional(automationProvenanceValidator),
  usageReservationDomainId: v.optional(v.string()),
  usageReservationId: v.optional(v.string()),
  ...saveArgs,
};

const postedStatusValidator = v.union(
  v.literal("active"),
  v.literal("all"),
  v.literal("posted"),
);

async function withVideoClipListMetrics<T>(
  ctx: unknown,
  label: string,
  resultPromise: Promise<T>,
) {
  const result = await resultPromise;
  await logConvexTransactionMetrics(ctx, label);

  return result;
}

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
        return await withVideoClipListMetrics(
          ctx,
          "videoClips.list",
          ctx.db
            .query("videoClipCards")
            .withIndex("by_owner_product_is_posted_created", (q) =>
              q
                .eq("ownerId", ownerId)
                .eq("productId", productFilterId)
                .eq("isPosted", undefined),
            )
            .order(sortOrder === "oldest" ? "asc" : "desc")
            .paginate(readLimitedPaginationOpts),
        );
      }

      return await withVideoClipListMetrics(
        ctx,
        "videoClips.list",
        ctx.db
          .query("videoClipCards")
          .withIndex("by_owner_is_posted_created", (q) =>
            q.eq("ownerId", ownerId).eq("isPosted", undefined),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts),
      );
    }

    if (postedStatus === "posted") {
      if (productFilterId) {
        return await withVideoClipListMetrics(
          ctx,
          "videoClips.list",
          ctx.db
            .query("videoClipCards")
            .withIndex("by_owner_product_is_posted_created", (q) =>
              q
                .eq("ownerId", ownerId)
                .eq("productId", productFilterId)
                .eq("isPosted", true),
            )
            .order(sortOrder === "oldest" ? "asc" : "desc")
            .paginate(readLimitedPaginationOpts),
        );
      }

      return await withVideoClipListMetrics(
        ctx,
        "videoClips.list",
        ctx.db
          .query("videoClipCards")
          .withIndex("by_owner_is_posted_created", (q) =>
            q.eq("ownerId", ownerId).eq("isPosted", true),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts),
      );
    }

    if (productFilterId) {
      return await withVideoClipListMetrics(
        ctx,
        "videoClips.list",
        ctx.db
          .query("videoClipCards")
          .withIndex("by_owner_product_created", (q) =>
            q.eq("ownerId", ownerId).eq("productId", productFilterId),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts),
      );
    }

    return await withVideoClipListMetrics(
      ctx,
      "videoClips.list",
      ctx.db
        .query("videoClipCards")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .paginate(readLimitedPaginationOpts),
    );
  },
});

export const listByLibraryKind = query({
  args: {
    kind: videoClipLibraryKindValidator,
    paginationOpts: paginationOptsValidator,
    productId: v.optional(v.string()),
    postedStatus: v.optional(postedStatusValidator),
    sortOrder: v.optional(librarySortOrderValidator),
  },
  handler: async (
    ctx,
    { kind, paginationOpts, productId, postedStatus = "all", sortOrder },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;
    const readLimitedPaginationOpts =
      getReadLimitedPaginationOpts(paginationOpts);

    if (postedStatus === "active") {
      if (productFilterId) {
        return await withVideoClipListMetrics(
          ctx,
          "videoClips.listByLibraryKind",
          ctx.db
            .query("videoClipCards")
            .withIndex("by_owner_product_library_kind_is_posted_created", (q) =>
              q
                .eq("ownerId", ownerId)
                .eq("productId", productFilterId)
                .eq("libraryKind", kind)
                .eq("isPosted", undefined),
            )
            .order(sortOrder === "oldest" ? "asc" : "desc")
            .paginate(readLimitedPaginationOpts),
        );
      }

      const query = ctx.db
        .query("videoClipCards")
        .withIndex("by_owner_library_kind_is_posted_created", (q) =>
          q
            .eq("ownerId", ownerId)
            .eq("libraryKind", kind)
            .eq("isPosted", undefined),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc");

      return await withVideoClipListMetrics(
        ctx,
        "videoClips.listByLibraryKind",
        query.paginate(readLimitedPaginationOpts),
      );
    }

    if (postedStatus === "posted") {
      if (productFilterId) {
        return await withVideoClipListMetrics(
          ctx,
          "videoClips.listByLibraryKind",
          ctx.db
            .query("videoClipCards")
            .withIndex("by_owner_product_library_kind_is_posted_created", (q) =>
              q
                .eq("ownerId", ownerId)
                .eq("productId", productFilterId)
                .eq("libraryKind", kind)
                .eq("isPosted", true),
            )
            .order(sortOrder === "oldest" ? "asc" : "desc")
            .paginate(readLimitedPaginationOpts),
        );
      }

      const query = ctx.db
        .query("videoClipCards")
        .withIndex("by_owner_library_kind_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("libraryKind", kind).eq("isPosted", true),
        )
        .order(sortOrder === "oldest" ? "asc" : "desc");

      return await withVideoClipListMetrics(
        ctx,
        "videoClips.listByLibraryKind",
        query.paginate(readLimitedPaginationOpts),
      );
    }

    if (productFilterId) {
      return await withVideoClipListMetrics(
        ctx,
        "videoClips.listByLibraryKind",
        ctx.db
          .query("videoClipCards")
          .withIndex("by_owner_product_library_kind_created", (q) =>
            q
              .eq("ownerId", ownerId)
              .eq("productId", productFilterId)
              .eq("libraryKind", kind),
          )
          .order(sortOrder === "oldest" ? "asc" : "desc")
          .paginate(readLimitedPaginationOpts),
      );
    }

    const query = ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_library_kind_created", (q) =>
        q.eq("ownerId", ownerId).eq("libraryKind", kind),
      )
      .order(sortOrder === "oldest" ? "asc" : "desc");

    return await withVideoClipListMetrics(
      ctx,
      "videoClips.listByLibraryKind",
      query.paginate(readLimitedPaginationOpts),
    );
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

export const getForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id }) => {
    assertProviderWorkerSecret(secret);

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

    const requestedProductId = getRequiredVideoClipProductId(args.productId);

    await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const clipArgs = {
      ...args,
      productId: requestedProductId,
    };

    const clip = {
      ownerId,
      ...clipArgs,
      libraryKind: getVideoClipLibraryKind(clipArgs),
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await Promise.all([
          videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip),
          videoClipProductCounts.replaceOrInsert(
            ctx,
            existingClip,
            updatedClip,
          ),
          upsertVideoClipCard(ctx, updatedClip),
        ]);
      }

      return existingClip._id;
    }

    const clipId = await ctx.db.insert("videoClips", clip);
    const insertedClip = await ctx.db.get(clipId);

    if (insertedClip) {
      await Promise.all([
        videoClipCounts.insertIfDoesNotExist(ctx, insertedClip),
        videoClipProductCounts.insertIfDoesNotExist(ctx, insertedClip),
        upsertVideoClipCard(ctx, insertedClip),
      ]);
    }

    const notificationCopy = getVideoClipNotificationCopy(args);

    await createNotification(ctx, {
      ownerId,
      productId: requestedProductId,
      sourceType: "video-clip",
      sourceId: args.id,
      dedupeKey: `video-clip:${args.id}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: args.createdAt,
    });

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

    const requestedProductId = getRequiredVideoClipProductId(args.productId);

    await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);

    const clipArgs = {
      ...args,
      productId: requestedProductId,
    };
    const clip = {
      ownerId,
      ...clipArgs,
      automation,
      libraryKind: getVideoClipLibraryKind(clipArgs),
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await Promise.all([
          videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip),
          videoClipProductCounts.replaceOrInsert(
            ctx,
            existingClip,
            updatedClip,
          ),
          upsertVideoClipCard(ctx, updatedClip),
        ]);
      }

      return existingClip._id;
    }

    const clipId = await ctx.db.insert("videoClips", clip);
    const insertedClip = await ctx.db.get(clipId);

    if (insertedClip) {
      await Promise.all([
        videoClipCounts.insertIfDoesNotExist(ctx, insertedClip),
        videoClipProductCounts.insertIfDoesNotExist(ctx, insertedClip),
        upsertVideoClipCard(ctx, insertedClip),
      ]);
    }

    return clipId;
  },
});

export const saveFromMediaWorker = mutation({
  args: saveFromMediaWorkerArgs,
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      automation,
      usageReservationDomainId,
      usageReservationId,
      ...args
    },
  ) => {
    assertMediaWorkerSecret(secret);

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (
      automation &&
      existingClip?.automation?.source === "automation" &&
      existingClip.automation.taskId === automation.taskId
    ) {
      return existingClip._id;
    }

    if (automation) {
      await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
        key: ownerId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
        throws: true,
      });
    } else {
      await rateLimiter.limit(ctx, "convexRecordSave", {
        key: ownerId,
        throws: true,
      });
    }

    const requestedProductId = getRequiredVideoClipProductId(args.productId);

    await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);

    let committedUsageReservationId = usageReservationId;

    if (args.swaprMetadata?.source === "swapr") {
      if (!usageReservationId) {
        throw new Error("Swapr usage reservation is missing.");
      }

      if (
        existingClip?.usageReservationId &&
        existingClip.usageReservationId !== usageReservationId
      ) {
        throw new Error("Video already has a different usage reservation.");
      }

      if (existingClip?.usageReservationId !== usageReservationId) {
        const binding = {
          domainId: usageReservationDomainId ?? "",
          domainKind: automation ? "automation_task" : "provider_job",
          operation: "swapr_video" as const,
          reservationKind: "worker" as const,
          resource: "ai_video" as const,
        };
        committedUsageReservationId = await reacquireUsageReservation(
          ctx,
          ownerId,
          usageReservationId,
          args.updatedAt,
          binding,
        );
        await commitUsageReservationForOwner(
          ctx,
          ownerId,
          committedUsageReservationId,
          args.updatedAt,
          "worker",
          binding,
        );
      }
    }

    const clipArgs = {
      ...args,
      productId: requestedProductId,
    };
    const clip = {
      ownerId,
      ...clipArgs,
      usageReservationId: committedUsageReservationId,
      libraryKind: getVideoClipLibraryKind(clipArgs),
      ...(automation ? { automation } : {}),
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await Promise.all([
          videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip),
          videoClipProductCounts.replaceOrInsert(
            ctx,
            existingClip,
            updatedClip,
          ),
          upsertVideoClipCard(ctx, updatedClip),
        ]);
      }

      return existingClip._id;
    }

    const clipId = await ctx.db.insert("videoClips", clip);
    const insertedClip = await ctx.db.get(clipId);

    if (insertedClip) {
      await Promise.all([
        videoClipCounts.insertIfDoesNotExist(ctx, insertedClip),
        videoClipProductCounts.insertIfDoesNotExist(ctx, insertedClip),
        upsertVideoClipCard(ctx, insertedClip),
      ]);
    }

    if (!automation) {
      const notificationCopy = getVideoClipNotificationCopy(args);

      await createNotification(ctx, {
        ownerId,
        productId: requestedProductId,
        sourceType: "video-clip",
        sourceId: args.id,
        dedupeKey: `video-clip:${args.id}:created`,
        title: notificationCopy.title,
        preview: notificationCopy.preview,
        message: notificationCopy.message,
        createdAt: args.createdAt,
      });
    }

    return clipId;
  },
});

export const updateMetadataFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    name: v.optional(v.string()),
    tags: v.optional(assetTagsValidator),
    videoDescription: v.optional(v.string()),
    mainPersonDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    performanceScore: v.optional(clipPerformanceScoreValidator),
    productDescription: v.optional(v.string()),
    productId: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      name,
      tags,
      videoDescription,
      mainPersonDescription,
      outfitDescription,
      locationDescription,
      poseDescription,
      performanceScore,
      productDescription,
      productId,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

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

    const requestedProductId =
      productId === undefined
        ? undefined
        : getRequiredVideoClipProductId(productId);

    if (requestedProductId) {
      await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);
    }

    await ctx.db.patch(clip._id, {
      ...(name === undefined ? {} : { name }),
      ...(tags === undefined ? {} : { tags }),
      ...(videoDescription === undefined ? {} : { videoDescription }),
      ...(mainPersonDescription === undefined ? {} : { mainPersonDescription }),
      ...(outfitDescription === undefined ? {} : { outfitDescription }),
      ...(locationDescription === undefined ? {} : { locationDescription }),
      ...(poseDescription === undefined ? {} : { poseDescription }),
      ...(performanceScore === undefined ? {} : { performanceScore }),
      ...(productDescription === undefined ? {} : { productDescription }),
      ...(productId === undefined ? {} : { productId: requestedProductId }),
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
    }
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

    let requestedProductId: string | undefined;

    if (productId !== undefined) {
      requestedProductId = getRequiredVideoClipProductId(productId);
      await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);
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
      ...(productId === undefined ? {} : { productId: requestedProductId }),
      ...(defaultTrimRange === undefined ? {} : { defaultTrimRange }),
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
    }
  },
});

export const updatePerformanceScore = mutation({
  args: {
    id: v.string(),
    performanceScore: clipPerformanceScoreValidator,
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, performanceScore, updatedAt }) => {
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

    await ctx.db.patch(clip._id, {
      performanceScore,
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await upsertVideoClipCard(ctx, updatedClip);
    }
  },
});

export const updateCrop = mutation({
  args: {
    id: v.string(),
    crop: v.union(quickEditCropValidator, v.null()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, crop, updatedAt }) => {
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

    const currentQuickEdit = clip.quickEdit;
    const nextQuickEdit = (() => {
      if (crop) {
        return {
          ...currentQuickEdit,
          appliedAt: updatedAt,
          crop,
          removeRanges: currentQuickEdit?.removeRanges ?? [],
          source: currentQuickEdit?.source ?? "manual-crop",
        };
      }

      if (
        !currentQuickEdit ||
        (!currentQuickEdit.removeRanges.length &&
          !currentQuickEdit.overlayText &&
          !currentQuickEdit.summary &&
          currentQuickEdit.trimStart === undefined &&
          currentQuickEdit.trimEnd === undefined)
      ) {
        return undefined;
      }

      const { crop: _crop, ...rest } = currentQuickEdit;

      void _crop;

      return {
        ...rest,
        appliedAt: updatedAt,
      };
    })();

    await ctx.db.patch(clip._id, {
      quickEdit: nextQuickEdit,
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
    }
  },
});

export const updateCuts = mutation({
  args: {
    id: v.string(),
    removeRanges: v.array(quickEditRemoveRangeValidator),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, removeRanges, updatedAt }) => {
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

    const normalizedRemoveRanges = normalizeQuickEditRemoveRanges(
      removeRanges,
      clip.duration,
    );
    const nextQuickEditSuggestions = getQuickEditWithRemoveRanges(
      clip.quickEdit,
      normalizedRemoveRanges,
    );
    const scoreCandidates =
      clip.performanceScore?.quickEditSuggestions?.candidates;
    const candidateEvidence =
      nextQuickEditSuggestions?.candidates?.length || !scoreCandidates?.length
        ? {}
        : { candidates: scoreCandidates };
    const nextQuickEdit = nextQuickEditSuggestions
      ? {
          ...nextQuickEditSuggestions,
          ...candidateEvidence,
          appliedAt: updatedAt,
          baseline:
            clip.quickEdit?.baseline ??
            (clip.defaultTrimRange
              ? { defaultTrimRange: clip.defaultTrimRange }
              : {}),
          source: "manual-cut" as const,
        }
      : undefined;

    await ctx.db.patch(clip._id, {
      quickEdit: nextQuickEdit,
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
    }
  },
});

export const applyQuickEdit = mutation({
  args: {
    id: v.string(),
    defaultTrimRange: videoTrimRangeValidator,
    quickEdit: quickEditSuggestionsValidator,
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, defaultTrimRange, quickEdit, updatedAt }) => {
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

    await ctx.db.patch(clip._id, {
      defaultTrimRange,
      quickEdit: {
        ...quickEdit,
        appliedAt: updatedAt,
        baseline: clip.defaultTrimRange
          ? { defaultTrimRange: clip.defaultTrimRange }
          : {},
        source: "ai-score",
      },
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
    }
  },
});

export const resetQuickEdit = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
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

    await ctx.db.patch(clip._id, {
      defaultTrimRange: clip.quickEdit?.baseline?.defaultTrimRange,
      quickEdit: undefined,
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
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
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
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
      libraryKind: getVideoClipLibraryKind(clip),
      updatedAt,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
      ]);
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

    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      throw new Error("Video clip not found.");
    }

    if (!getVideoClipCanBePosted(clip)) {
      throw new Error("Only script clips can be marked posted.");
    }

    await ctx.db.patch(clip._id, {
      isPosted: isPosted ? true : undefined,
      postedAt: isPosted ? new Date().toISOString() : undefined,
    });
    const updatedClip = await ctx.db.get(clip._id);

    if (updatedClip) {
      await Promise.all([
        videoClipCounts.replaceOrInsert(ctx, clip, updatedClip),
        videoClipProductCounts.replaceOrInsert(ctx, clip, updatedClip),
        upsertVideoClipCard(ctx, updatedClip),
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

    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!clip) {
      return null;
    }

    if (clip.clipType === "demo") {
      const products = await ctx.db
        .query("products")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .take(200);

      for (const product of products) {
        if (product.defaultDemoClipId === clip.id) {
          await ctx.db.patch(product._id, {
            defaultDemoClipId: undefined,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    await ctx.db.delete(clip._id);
    await Promise.all([
      videoClipCounts.deleteIfExists(ctx, clip),
      videoClipProductCounts.deleteIfExists(ctx, clip),
      deleteVideoClipCard(ctx, clip),
    ]);
    return clip;
  },
});
