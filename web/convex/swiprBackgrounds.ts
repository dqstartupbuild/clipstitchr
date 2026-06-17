import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { r2ObjectValidator } from "./validators/r2Object";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";

const BACKGROUND_NAME_MAX_LENGTH = 120;
const BACKGROUND_DESCRIPTION_MAX_LENGTH = 1200;
const BACKGROUND_DETAILS_MAX_LENGTH = 3000;
const BACKGROUND_LIBRARY_QUERY_MAX_LENGTH = 120;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    const backgrounds = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return backgrounds.filter(
      (background) => background.uploadedByOwnerId === ownerId,
    );
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const background = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", id))
      .unique();

    if (!background || background.uploadedByOwnerId !== ownerId) {
      return null;
    }

    return background;
  },
});

const saveArgs = {
  id: v.string(),
  name: v.string(),
  tags: assetTagsValidator,
  description: v.optional(v.string()),
  details: v.optional(v.string()),
  libraryQuery: v.optional(v.string()),
  source: swiprBackgroundSourceValidator,
  imageObject: r2ObjectValidator,
  mimeType: v.string(),
  size: v.number(),
  width: v.number(),
  height: v.number(),
  createdAt: v.string(),
};

export const getFromProvider = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, secret }) => {
    assertProviderWorkerSecret(secret);

    const background = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", id))
      .unique();

    if (!background || background.uploadedByOwnerId !== ownerId) {
      return null;
    }

    return background;
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingBackground = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", args.id))
      .unique();
    const name = normalizeText(args.name, BACKGROUND_NAME_MAX_LENGTH);

    if (!name) {
      throw new Error("Background name is required.");
    }

    if (existingBackground) {
      throw new Error("Background already exists.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    return await ctx.db.insert("swiprBackgrounds", {
      uploadedByOwnerId: ownerId,
      ...args,
      name,
      description: args.description
        ? normalizeText(args.description, BACKGROUND_DESCRIPTION_MAX_LENGTH)
        : undefined,
      details: args.details
        ? normalizeText(args.details, BACKGROUND_DETAILS_MAX_LENGTH)
        : undefined,
      libraryQuery: args.libraryQuery
        ? normalizeText(args.libraryQuery, BACKGROUND_LIBRARY_QUERY_MAX_LENGTH)
        : undefined,
    });
  },
});

export const saveFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    ...saveArgs,
  },
  handler: async (ctx, { secret, ownerId, ...args }) => {
    assertProviderWorkerSecret(secret);

    const existingBackground = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_background_id", (q) => q.eq("id", args.id))
      .unique();
    const name = normalizeText(args.name, BACKGROUND_NAME_MAX_LENGTH);

    if (!name) {
      throw new Error("Background name is required.");
    }

    if (existingBackground) {
      throw new Error("Background already exists.");
    }

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    return await ctx.db.insert("swiprBackgrounds", {
      uploadedByOwnerId: ownerId,
      ...args,
      name,
      description: args.description
        ? normalizeText(args.description, BACKGROUND_DESCRIPTION_MAX_LENGTH)
        : undefined,
      details: args.details
        ? normalizeText(args.details, BACKGROUND_DETAILS_MAX_LENGTH)
        : undefined,
      libraryQuery: args.libraryQuery
        ? normalizeText(args.libraryQuery, BACKGROUND_LIBRARY_QUERY_MAX_LENGTH)
        : undefined,
    });
  },
});
