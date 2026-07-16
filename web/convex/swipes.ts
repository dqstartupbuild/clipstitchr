import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { deleteSwipeCard } from "./deleteSwipeCard";
import { getSwipeNotificationCopy } from "./getSwipeNotificationCopy";
import { upsertPostBridgePostProductMapping } from "./postBridgePostProductMappings";
import { rateLimiter } from "./rateLimiter";
import { upsertSwipeCard } from "./upsertSwipeCard";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { postBridgePostReferenceValidator } from "./validators/postBridgePostReference";
import { r2ObjectValidator } from "./validators/r2Object";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";
import { normalizeSwiprSwipeFields } from "../lib/clipstitchr/utils/normalizeSwiprSwipeFields";
import { commitSwipeUsageReservation } from "./usage/commitSwipeUsageReservation";

const postedStatusValidator = v.union(
  v.literal("active"),
  v.literal("all"),
  v.literal("posted"),
);
const SWIPE_LIST_LIMIT = 120;

const saveArgs = {
  id: v.string(),
  name: v.string(),
  productSourceType: swiprProductSourceTypeValidator,
  productSourceId: v.string(),
  productContext: v.string(),
  productName: v.string(),
  backgroundId: v.string(),
  caption: v.optional(v.string()),
  description: v.optional(v.string()),
  hashtags: v.optional(v.array(v.string())),
  rationale: v.optional(v.string()),
  socialCaption: v.optional(v.string()),
  slides: v.array(swiprSlideValidator),
  posterObject: v.optional(r2ObjectValidator),
  posterVersion: v.optional(v.number()),
  usageReservationId: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
};

const saveFromAutomationArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: automationProvenanceValidator,
  usageReservationDomainId: v.optional(v.string()),
  ...saveArgs,
};

const saveFromProviderArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: v.optional(automationProvenanceValidator),
  usageReservationDomainId: v.optional(v.string()),
  ...saveArgs,
};

export const list = query({
  args: {
    productId: v.optional(v.string()),
    postedStatus: v.optional(postedStatusValidator),
  },
  handler: async (ctx, { productId, postedStatus = "all" }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;

    if (postedStatus === "active") {
      if (productFilterId) {
        return await ctx.db
          .query("swipeCards")
          .withIndex("by_owner_product_is_posted_updated", (q) =>
            q
              .eq("ownerId", ownerId)
              .eq("productSourceId", productFilterId)
              .eq("isPosted", undefined),
          )
          .order("desc")
          .take(SWIPE_LIST_LIMIT);
      }

      return await ctx.db
        .query("swipeCards")
        .withIndex("by_owner_is_posted_updated", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", undefined),
        )
        .order("desc")
        .take(SWIPE_LIST_LIMIT);
    }

    if (postedStatus === "posted") {
      if (productFilterId) {
        return await ctx.db
          .query("swipeCards")
          .withIndex("by_owner_product_is_posted_updated", (q) =>
            q
              .eq("ownerId", ownerId)
              .eq("productSourceId", productFilterId)
              .eq("isPosted", true),
          )
          .order("desc")
          .take(SWIPE_LIST_LIMIT);
      }

      return await ctx.db
        .query("swipeCards")
        .withIndex("by_owner_is_posted_updated", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", true),
        )
        .order("desc")
        .take(SWIPE_LIST_LIMIT);
    }

    if (productFilterId) {
      return await ctx.db
        .query("swipeCards")
        .withIndex("by_owner_product_updated", (q) =>
          q.eq("ownerId", ownerId).eq("productSourceId", productFilterId),
        )
        .order("desc")
        .take(SWIPE_LIST_LIMIT);
    }

    return await ctx.db
      .query("swipeCards")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(SWIPE_LIST_LIMIT);
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, { usageReservationId, ...args }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();
    const background = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", args.backgroundId))
      .unique();

    if (!background || background.uploadedByOwnerId !== ownerId) {
      throw new Error("Swipr background not found.");
    }

    const slideBackgroundIds = [
      ...new Set(
        args.slides
          .map((slide) => slide.backgroundId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    for (const slideBackgroundId of slideBackgroundIds) {
      const slideBackground = await ctx.db
        .query("swiprBackgrounds")
        .withIndex("by_background_id", (q) => q.eq("id", slideBackgroundId))
        .unique();

      if (!slideBackground || slideBackground.uploadedByOwnerId !== ownerId) {
        throw new Error("Swipr slide background not found.");
      }
    }

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.productSourceId),
      )
      .unique();

    if (!product) {
      throw new Error("Product not found.");
    }

    const existingSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    await rateLimiter.limit(
      ctx,
      existingSwipe ? "convexMetadataUpdate" : "convexRecordSave",
      {
        key: ownerId,
        throws: true,
      },
    );

    if (
      existingSwipe?.usageReservationId &&
      existingSwipe.usageReservationId !== usageReservationId
    ) {
      throw new Error("Swipe already has a different usage reservation.");
    }

    const normalizedFields = normalizeSwiprSwipeFields(args);
    const committedUsageReservationId =
      existingSwipe?.usageReservationId === usageReservationId
        ? usageReservationId
        : await commitSwipeUsageReservation(
            ctx,
            ownerId,
            usageReservationId,
            now,
            "user_action",
            {
              domainId: args.id,
              domainKind: "swipe",
              operation: "swipr",
              reservationKind: "worker",
              resource: "creation_credit",
            },
          );
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
      ...(committedUsageReservationId
        ? { usageReservationId: committedUsageReservationId }
        : {}),
    };

    if (!normalizedFields.name) {
      throw new Error("Swipe name is required.");
    }

    if (!normalizedFields.productName) {
      throw new Error("Swipe product name is required.");
    }

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      const updatedSwipe = await ctx.db.get(existingSwipe._id);

      if (updatedSwipe) {
        await upsertSwipeCard(ctx, updatedSwipe);
      }

      return existingSwipe._id;
    }

    const swipeDocumentId = await ctx.db.insert("swipes", swipe);
    const insertedSwipe = await ctx.db.get(swipeDocumentId);

    if (insertedSwipe) {
      await upsertSwipeCard(ctx, insertedSwipe);
    }

    const notificationCopy = getSwipeNotificationCopy({
      name: normalizedFields.name,
      productName: normalizedFields.productName,
    });

    await createNotification(ctx, {
      ownerId,
      productId: args.productSourceId,
      sourceType: "swipe",
      sourceId: args.id,
      dedupeKey: `swipe:${args.id}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: args.createdAt,
    });

    return swipeDocumentId;
  },
});

export const saveFromAutomation = mutation({
  args: saveFromAutomationArgs,
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
    assertAutomationWorkerSecret(secret);

    const background = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", args.backgroundId))
      .unique();
    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.productSourceId),
      )
      .unique();

    if (!background || background.uploadedByOwnerId !== ownerId || !product) {
      throw new Error("Automation Swipe source records were not found.");
    }

    const slideBackgroundIds = [
      ...new Set(
        args.slides
          .map((slide) => slide.backgroundId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    for (const slideBackgroundId of slideBackgroundIds) {
      const slideBackground = await ctx.db
        .query("swiprBackgrounds")
        .withIndex("by_background_id", (q) => q.eq("id", slideBackgroundId))
        .unique();

      if (!slideBackground || slideBackground.uploadedByOwnerId !== ownerId) {
        throw new Error("Swipr slide background not found.");
      }
    }

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    const existingSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    if (
      existingSwipe?.usageReservationId &&
      existingSwipe.usageReservationId !== usageReservationId
    ) {
      throw new Error("Swipe already has a different usage reservation.");
    }

    const normalizedFields = normalizeSwiprSwipeFields(args);
    const committedUsageReservationId =
      existingSwipe?.usageReservationId === usageReservationId
        ? usageReservationId
        : await commitSwipeUsageReservation(
            ctx,
            ownerId,
            usageReservationId,
            args.updatedAt,
            "worker",
            {
              domainId: usageReservationDomainId ?? "",
              domainKind: "automation_task",
              operation: "swipr",
              reservationKind: "worker",
              resource: "creation_credit",
            },
          );
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
      automation,
      ...(committedUsageReservationId
        ? { usageReservationId: committedUsageReservationId }
        : {}),
    };

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      const updatedSwipe = await ctx.db.get(existingSwipe._id);

      if (updatedSwipe) {
        await upsertSwipeCard(ctx, updatedSwipe);
      }

      return existingSwipe._id;
    }

    const swipeDocumentId = await ctx.db.insert("swipes", swipe);
    const insertedSwipe = await ctx.db.get(swipeDocumentId);

    if (insertedSwipe) {
      await upsertSwipeCard(ctx, insertedSwipe);
    }

    return swipeDocumentId;
  },
});

export const saveFromProvider = mutation({
  args: saveFromProviderArgs,
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
    assertProviderWorkerSecret(secret);

    const background = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", args.backgroundId))
      .unique();
    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.productSourceId),
      )
      .unique();

    if (!background || background.uploadedByOwnerId !== ownerId || !product) {
      throw new Error("Swipe source records were not found.");
    }

    const slideBackgroundIds = [
      ...new Set(
        args.slides
          .map((slide) => slide.backgroundId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    for (const slideBackgroundId of slideBackgroundIds) {
      const slideBackground = await ctx.db
        .query("swiprBackgrounds")
        .withIndex("by_background_id", (q) => q.eq("id", slideBackgroundId))
        .unique();

      if (!slideBackground || slideBackground.uploadedByOwnerId !== ownerId) {
        throw new Error("Swipr slide background not found.");
      }
    }

    const existingSwipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (automation) {
      await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
        key: ownerId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
        throws: true,
      });
    } else {
      await rateLimiter.limit(
        ctx,
        existingSwipe ? "convexMetadataUpdate" : "convexRecordSave",
        {
          key: ownerId,
          throws: true,
        },
      );
    }

    if (
      existingSwipe?.usageReservationId &&
      existingSwipe.usageReservationId !== usageReservationId
    ) {
      throw new Error("Swipe already has a different usage reservation.");
    }

    const normalizedFields = normalizeSwiprSwipeFields(args);
    const committedUsageReservationId =
      existingSwipe?.usageReservationId === usageReservationId
        ? usageReservationId
        : await commitSwipeUsageReservation(
            ctx,
            ownerId,
            usageReservationId,
            args.updatedAt,
            "worker",
            {
              domainId: automation ? (usageReservationDomainId ?? "") : args.id,
              domainKind: automation ? "automation_task" : "swipe",
              operation: "swipr",
              reservationKind: "worker",
              resource: "creation_credit",
            },
          );
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
      ...(automation ? { automation } : {}),
      ...(committedUsageReservationId
        ? { usageReservationId: committedUsageReservationId }
        : {}),
    };

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      const updatedSwipe = await ctx.db.get(existingSwipe._id);

      if (updatedSwipe) {
        await upsertSwipeCard(ctx, updatedSwipe);
      }

      return existingSwipe._id;
    }

    const swipeDocumentId = await ctx.db.insert("swipes", swipe);
    const insertedSwipe = await ctx.db.get(swipeDocumentId);

    if (insertedSwipe) {
      await upsertSwipeCard(ctx, insertedSwipe);
    }

    if (!automation) {
      const notificationCopy = getSwipeNotificationCopy({
        name: normalizedFields.name,
        productName: normalizedFields.productName,
      });

      await createNotification(ctx, {
        ownerId,
        productId: args.productSourceId,
        sourceType: "swipe",
        sourceId: args.id,
        dedupeKey: `swipe:${args.id}:created`,
        title: notificationCopy.title,
        preview: notificationCopy.preview,
        message: notificationCopy.message,
        createdAt: args.createdAt,
      });
    }

    return swipeDocumentId;
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

    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!swipe) {
      throw new Error("Swipe not found.");
    }

    await ctx.db.patch(swipe._id, {
      isPosted: isPosted ? true : undefined,
      postedAt: isPosted ? new Date().toISOString() : undefined,
    });
    const updatedSwipe = await ctx.db.get(swipe._id);

    if (updatedSwipe) {
      await upsertSwipeCard(ctx, updatedSwipe);
    }
  },
});

export const addPostBridgePost = mutation({
  args: {
    id: v.string(),
    post: postBridgePostReferenceValidator,
  },
  handler: async (ctx, { id, post }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!swipe) {
      throw new Error("Swipe not found.");
    }

    await ctx.db.patch(swipe._id, {
      isPosted: true,
      postBridgePosts: [
        ...(swipe.postBridgePosts ?? []).filter(
          (existingPost) => existingPost.postId !== post.postId,
        ),
        post,
      ],
      postedAt: swipe.postedAt ?? now,
      updatedAt: now,
    });
    const updatedSwipe = await ctx.db.get(swipe._id);

    if (updatedSwipe) {
      await Promise.all([
        upsertPostBridgePostProductMapping(ctx, {
          ownerId,
          post,
          productId: updatedSwipe.productSourceId,
          sourceId: updatedSwipe.id,
          sourceType: "swipe",
        }),
        upsertSwipeCard(ctx, updatedSwipe),
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

    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!swipe) {
      return null;
    }

    await ctx.db.delete(swipe._id);
    await deleteSwipeCard(ctx, swipe);

    return swipe;
  },
});
