import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { r2ObjectValidator } from "./validators/r2Object";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";
import { normalizeAutomationSwiprSelectedLibraryPackNames } from "../lib/clipstitchr/utils/normalizeAutomationSwiprSelectedLibraryPackNames";
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

function getIsGlobalPexelsPackBackground(background: {
  libraryQuery?: string;
  source: string;
}) {
  return background.source === "pexels" && Boolean(background.libraryQuery);
}

async function getOwnerLibraryPackAccountKeys(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  const packAccounts = await ctx.db
    .query("swiprLibraryPackAccounts")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  return new Set(
    packAccounts.map((packAccount) => packAccount.libraryQueryKey),
  );
}

function getBackgroundBelongsToOwnerPack(
  background: {
    libraryQuery?: string;
    source: string;
    uploadedByOwnerId: string;
  },
  ownerId: string,
  ownerLibraryPackAccountKeys: Set<string>,
) {
  if (background.uploadedByOwnerId === ownerId) {
    return true;
  }

  if (!getIsGlobalPexelsPackBackground(background)) {
    return false;
  }

  return ownerLibraryPackAccountKeys.has(
    normalizeSwiprLibraryQueryKey(background.libraryQuery),
  );
}

async function getGlobalPexelsPackBackgrounds(ctx: MutationCtx | QueryCtx) {
  const backgrounds = await ctx.db
    .query("swiprBackgrounds")
    .withIndex("by_created")
    .order("desc")
    .collect();

  return backgrounds.filter(getIsGlobalPexelsPackBackground);
}

async function getGlobalPexelsPackByQueryKey(
  ctx: MutationCtx | QueryCtx,
  libraryQueryKey: string,
) {
  const backgrounds = await getGlobalPexelsPackBackgrounds(ctx);
  const packBackgrounds = backgrounds.filter(
    (background) =>
      normalizeSwiprLibraryQueryKey(background.libraryQuery) ===
      libraryQueryKey,
  );

  return {
    backgrounds: packBackgrounds,
    libraryQuery: packBackgrounds[0]?.libraryQuery,
  };
}

async function ensureOwnerLibraryPackAccount(
  ctx: MutationCtx,
  ownerId: string,
  libraryQuery: string,
) {
  const normalizedLibraryQuery = normalizeSwiprLibraryQueryName(libraryQuery);
  const libraryQueryKey = normalizeSwiprLibraryQueryKey(normalizedLibraryQuery);

  if (!normalizedLibraryQuery || !libraryQueryKey) {
    throw new Error("Pack name is required.");
  }

  const existingAccount = await ctx.db
    .query("swiprLibraryPackAccounts")
    .withIndex("by_owner_query", (q) =>
      q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
    )
    .unique();

  if (existingAccount) {
    return existingAccount._id;
  }

  return await ctx.db.insert("swiprLibraryPackAccounts", {
    ownerId,
    libraryQuery: normalizedLibraryQuery,
    libraryQueryKey,
    createdAt: new Date().toISOString(),
  });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const ownerLibraryPackAccountKeys =
      await getOwnerLibraryPackAccountKeys(ctx, ownerId);

    const backgrounds = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return backgrounds
      .filter((background) =>
        getBackgroundBelongsToOwnerPack(
          background,
          ownerId,
          ownerLibraryPackAccountKeys,
        ),
      )
      .map((background) => ({
        ...background,
        isOwnedByCurrentUser: background.uploadedByOwnerId === ownerId,
      }));
  },
});

export const listGlobalPexels = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const backgrounds = await getGlobalPexelsPackBackgrounds(ctx);

    return backgrounds.map((background) => ({
      ...background,
      isOwnedByCurrentUser: background.uploadedByOwnerId === ownerId,
    }));
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

    if (
      !background ||
      (background.uploadedByOwnerId !== ownerId &&
        !getIsGlobalPexelsPackBackground(background))
    ) {
      return null;
    }

    return {
      ...background,
      isOwnedByCurrentUser: background.uploadedByOwnerId === ownerId,
    };
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

export const listForProviderByLibraryPackNames = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    libraryPackNames: v.array(v.string()),
  },
  handler: async (ctx, { secret, ownerId, libraryPackNames }) => {
    assertProviderWorkerSecret(secret);

    const selectedPackKeys = new Set(
      normalizeAutomationSwiprSelectedLibraryPackNames(libraryPackNames).map(
        normalizeSwiprLibraryQueryKey,
      ),
    );
    const ownerLibraryPackAccountKeys =
      await getOwnerLibraryPackAccountKeys(ctx, ownerId);

    if (selectedPackKeys.size === 0) {
      return [];
    }

    const backgrounds = await ctx.db
      .query("swiprBackgrounds")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return backgrounds.filter(
      (background) =>
        getBackgroundBelongsToOwnerPack(
          background,
          ownerId,
          ownerLibraryPackAccountKeys,
        ) &&
        getIsGlobalPexelsPackBackground(background) &&
        selectedPackKeys.has(
          normalizeSwiprLibraryQueryKey(background.libraryQuery),
        ),
    );
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

    const backgroundDocumentId = await ctx.db.insert("swiprBackgrounds", {
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

    if (args.source === "pexels" && args.libraryQuery) {
      await ensureOwnerLibraryPackAccount(ctx, ownerId, args.libraryQuery);
    }

    return backgroundDocumentId;
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

    const backgroundDocumentId = await ctx.db.insert("swiprBackgrounds", {
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

    if (args.source === "pexels" && args.libraryQuery) {
      await ensureOwnerLibraryPackAccount(ctx, ownerId, args.libraryQuery);
    }

    return backgroundDocumentId;
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

export const addLibraryPackToAccount = mutation({
  args: {
    libraryQuery: v.string(),
  },
  handler: async (ctx, { libraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedLibraryQuery = normalizeSwiprLibraryQueryName(libraryQuery);
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(normalizedLibraryQuery);

    if (!normalizedLibraryQuery || !libraryQueryKey) {
      throw new Error("Pack name is required.");
    }

    const pack = await getGlobalPexelsPackByQueryKey(ctx, libraryQueryKey);

    if (!pack.backgrounds.length || !pack.libraryQuery) {
      throw new Error("Pexels pack not found.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await ensureOwnerLibraryPackAccount(ctx, ownerId, pack.libraryQuery);

    return {
      count: pack.backgrounds.length,
      libraryQuery: pack.libraryQuery,
    };
  },
});

export const removeLibraryPackFromAccount = mutation({
  args: {
    libraryQuery: v.string(),
  },
  handler: async (ctx, { libraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);
    const existingAccount = await ctx.db
      .query("swiprLibraryPackAccounts")
      .withIndex("by_owner_query", (q) =>
        q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
      )
      .unique();

    if (!existingAccount) {
      return {
        count: 0,
      };
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await ctx.db.delete(existingAccount._id);

    return {
      count: 1,
    };
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

    const fromLibraryQueryKey = normalizeSwiprLibraryQueryKey(fromLibraryQuery);
    const packAccounts = await ctx.db
      .query("swiprLibraryPackAccounts")
      .withIndex("by_query_key", (q) =>
        q.eq("libraryQueryKey", fromLibraryQueryKey),
      )
      .collect();
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);

    for (const background of backgrounds) {
      await ctx.db.patch(background._id, {
        libraryQuery,
      });
    }

    for (const packAccount of packAccounts) {
      await ctx.db.patch(packAccount._id, {
        libraryQuery,
        libraryQueryKey,
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

    const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);
    const packAccounts = await ctx.db
      .query("swiprLibraryPackAccounts")
      .withIndex("by_query_key", (q) => q.eq("libraryQueryKey", libraryQueryKey))
      .collect();

    for (const background of backgrounds) {
      await ctx.db.delete(background._id);
    }

    for (const packAccount of packAccounts) {
      await ctx.db.delete(packAccount._id);
    }

    return {
      count: backgrounds.length,
    };
  },
});
