import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { getSwipeNotificationCopy } from "./getSwipeNotificationCopy";
import { rateLimiter } from "./rateLimiter";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { r2ObjectValidator } from "./validators/r2Object";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";
import { normalizeSwiprSwipeFields } from "../lib/clipstitchr/utils/normalizeSwiprSwipeFields";

const postedStatusValidator = v.union(
  v.literal("active"),
  v.literal("all"),
  v.literal("posted"),
);

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
    productId: v.optional(v.string()),
    postedStatus: v.optional(postedStatusValidator),
  },
  handler: async (ctx, { productId, postedStatus = "all" }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;
    const swipes = ctx.db
      .query("swipes")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
      .order("desc");
    const productSwipes = productFilterId
      ? swipes.filter((q) => q.eq(q.field("productSourceId"), productFilterId))
      : swipes;

    if (postedStatus === "active") {
      return await productSwipes
        .filter((q) => q.eq(q.field("isPosted"), undefined))
        .collect();
    }

    if (postedStatus === "posted") {
      return await productSwipes
        .filter((q) => q.eq(q.field("isPosted"), true))
        .collect();
    }

    return await productSwipes.collect();
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
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
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

    const normalizedFields = normalizeSwiprSwipeFields(args);
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
    };

    if (!normalizedFields.name) {
      throw new Error("Swipe name is required.");
    }

    if (!normalizedFields.productName) {
      throw new Error("Swipe product name is required.");
    }

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      return existingSwipe._id;
    }

    const swipeDocumentId = await ctx.db.insert("swipes", swipe);
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
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
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
    const normalizedFields = normalizeSwiprSwipeFields(args);
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
      automation,
    };

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      return existingSwipe._id;
    }

    return await ctx.db.insert("swipes", swipe);
  },
});

export const saveFromProvider = mutation({
  args: saveFromAutomationArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
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
    const normalizedFields = normalizeSwiprSwipeFields(args);
    const swipe = {
      ownerId,
      ...args,
      ...normalizedFields,
      automation,
    };

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      return existingSwipe._id;
    }

    return await ctx.db.insert("swipes", swipe);
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
    return swipe;
  },
});
