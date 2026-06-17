import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { r2ObjectValidator } from "./validators/r2Object";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";
import { normalizeSwiprLibraryQueryKey } from "../lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";
import { normalizeSwiprLibraryQueryName } from "../lib/clipstitchr/utils/normalizeSwiprLibraryQueryName";

const BACKGROUND_NAME_MAX_LENGTH = 120;
const BACKGROUND_DESCRIPTION_MAX_LENGTH = 1200;
const BACKGROUND_DETAILS_MAX_LENGTH = 3000;
const BACKGROUND_LIBRARY_QUERY_MAX_LENGTH = 120;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

async function getOwnerLibraryPackBackgrounds(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  libraryQuery: string,
) {
  const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);
  const backgrounds = await ctx.db
    .query("swiprBackgrounds")
    .withIndex("by_created")
    .collect();

  return backgrounds.filter(
    (background) =>
      background.uploadedByOwnerId === ownerId &&
      background.source === "pexels" &&
      normalizeSwiprLibraryQueryKey(background.libraryQuery) ===
        libraryQueryKey,
  );
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
  pexelsPhotoId: v.optional(v.number()),
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

export const removeFromLibraryPack = mutation({
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
      throw new Error("Swipr photo not found.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await ctx.db.patch(background._id, {
      libraryQuery: undefined,
    });

    return background;
  },
});

export const renameLibraryPack = mutation({
  args: {
    fromLibraryQuery: v.string(),
    toLibraryQuery: v.string(),
  },
  handler: async (ctx, { fromLibraryQuery, toLibraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const libraryQuery = normalizeSwiprLibraryQueryName(toLibraryQuery);

    if (!libraryQuery) {
      throw new Error("Pack name is required.");
    }

    const backgrounds = await getOwnerLibraryPackBackgrounds(
      ctx,
      ownerId,
      fromLibraryQuery,
    );

    if (!backgrounds.length) {
      throw new Error("Pexels pack not found.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      count: backgrounds.length,
      key: ownerId,
      throws: true,
    });

    for (const background of backgrounds) {
      await ctx.db.patch(background._id, {
        libraryQuery,
      });
    }

    return {
      count: backgrounds.length,
      libraryQuery,
    };
  },
});

export const removeLibraryPack = mutation({
  args: {
    libraryQuery: v.string(),
  },
  handler: async (ctx, { libraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const backgrounds = await getOwnerLibraryPackBackgrounds(
      ctx,
      ownerId,
      libraryQuery,
    );

    if (!backgrounds.length) {
      return {
        count: 0,
      };
    }

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      count: backgrounds.length,
      key: ownerId,
      throws: true,
    });

    for (const background of backgrounds) {
      await ctx.db.delete(background._id);
    }

    return {
      count: backgrounds.length,
    };
  },
});
