import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";

const SWIPE_NAME_MAX_LENGTH = 120;
const SWIPE_PRODUCT_CONTEXT_MAX_LENGTH = 2000;
const SWIPE_PRODUCT_NAME_MAX_LENGTH = 120;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

const saveArgs = {
  id: v.string(),
  name: v.string(),
  productSourceType: swiprProductSourceTypeValidator,
  productSourceId: v.string(),
  productContext: v.string(),
  productName: v.string(),
  backgroundId: v.string(),
  slides: v.array(swiprSlideValidator),
  createdAt: v.string(),
  updatedAt: v.string(),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("swipes")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
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

    if (!background) {
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

      if (!slideBackground) {
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
      throw new Error("Saved Settings product not found.");
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

    const swipe = {
      ownerId,
      ...args,
      name: normalizeText(args.name, SWIPE_NAME_MAX_LENGTH),
      productContext: normalizeText(
        args.productContext,
        SWIPE_PRODUCT_CONTEXT_MAX_LENGTH,
      ),
      productName: normalizeText(args.productName, SWIPE_PRODUCT_NAME_MAX_LENGTH),
    };

    if (!swipe.name) {
      throw new Error("Swipe name is required.");
    }

    if (!swipe.productName) {
      throw new Error("Swipe product name is required.");
    }

    if (existingSwipe) {
      await ctx.db.patch(existingSwipe._id, swipe);
      return existingSwipe._id;
    }

    return await ctx.db.insert("swipes", swipe);
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
