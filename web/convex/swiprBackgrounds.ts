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

function getIsGlobalPexelsPackBackground(background: {
  libraryQuery?: string;
  source: string;
}) {
  return background.source === "pexels" && Boolean(background.libraryQuery);
}

async function getOwnerLibraryPackAccount(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  libraryQueryKey: string,
) {
  return await ctx.db
    .query("swiprLibraryPackAccounts")
    .withIndex("by_owner_query", (q) =>
      q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
    )
    .unique();
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
  if (getIsGlobalPexelsPackBackground(background)) {
    return ownerLibraryPackAccountKeys.has(
      normalizeSwiprLibraryQueryKey(background.libraryQuery),
    );
  }

  return background.uploadedByOwnerId === ownerId;
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

  const existingAccount = await getOwnerLibraryPackAccount(
    ctx,
    ownerId,
    libraryQueryKey,
  );

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

async function getOwnerLibraryPackPhotoExclusionBackgroundIds(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
) {
  const exclusions = await ctx.db
    .query("swiprLibraryPackPhotoExclusions")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .collect();

  return new Set(exclusions.map((exclusion) => exclusion.backgroundId));
}

async function deleteOwnerLibraryPackPhotoExclusions(
  ctx: MutationCtx,
  ownerId: string,
  libraryQueryKey: string,
) {
  const exclusions = await ctx.db
    .query("swiprLibraryPackPhotoExclusions")
    .withIndex("by_owner_query", (q) =>
      q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
    )
    .collect();

  for (const exclusion of exclusions) {
    await ctx.db.delete(exclusion._id);
  }

  return exclusions.length;
}

async function removeOwnerLibraryPackAccount(
  ctx: MutationCtx,
  ownerId: string,
  libraryQueryKey: string,
) {
  const existingAccount = await getOwnerLibraryPackAccount(
    ctx,
    ownerId,
    libraryQueryKey,
  );

  if (!existingAccount) {
    await deleteOwnerLibraryPackPhotoExclusions(ctx, ownerId, libraryQueryKey);

    return 0;
  }

  await ctx.db.delete(existingAccount._id);
  await deleteOwnerLibraryPackPhotoExclusions(ctx, ownerId, libraryQueryKey);

  return 1;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const ownerLibraryPackAccountKeys =
      await getOwnerLibraryPackAccountKeys(ctx, ownerId);
    const excludedBackgroundIds =
      await getOwnerLibraryPackPhotoExclusionBackgroundIds(ctx, ownerId);

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
        ) && !excludedBackgroundIds.has(background.id),
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
    const excludedBackgroundIds =
      await getOwnerLibraryPackPhotoExclusionBackgroundIds(ctx, ownerId);

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
        !excludedBackgroundIds.has(background.id) &&
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

    if (!background || !getIsGlobalPexelsPackBackground(background)) {
      throw new Error("Swipr photo not found.");
    }

    const libraryQueryKey = normalizeSwiprLibraryQueryKey(
      background.libraryQuery,
    );
    const existingAccount = await getOwnerLibraryPackAccount(
      ctx,
      ownerId,
      libraryQueryKey,
    );

    if (!existingAccount) {
      throw new Error("Pexels pack is not in your account.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    const existingExclusion = await ctx.db
      .query("swiprLibraryPackPhotoExclusions")
      .withIndex("by_owner_background", (q) =>
        q.eq("ownerId", ownerId).eq("backgroundId", background.id),
      )
      .unique();

    if (!existingExclusion) {
      await ctx.db.insert("swiprLibraryPackPhotoExclusions", {
        ownerId,
        backgroundId: background.id,
        libraryQuery: background.libraryQuery ?? "",
        libraryQueryKey,
        createdAt: new Date().toISOString(),
      });
    }

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
    await deleteOwnerLibraryPackPhotoExclusions(
      ctx,
      ownerId,
      libraryQueryKey,
    );

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
    const existingAccount = await getOwnerLibraryPackAccount(
      ctx,
      ownerId,
      libraryQueryKey,
    );

    if (!existingAccount) {
      await deleteOwnerLibraryPackPhotoExclusions(
        ctx,
        ownerId,
        libraryQueryKey,
      );

      return {
        count: 0,
      };
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await removeOwnerLibraryPackAccount(ctx, ownerId, libraryQueryKey);

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
    await getAuthenticatedOwnerId(ctx);
    void fromLibraryQuery;
    void toLibraryQuery;

    throw new Error("Pexels packs are shared now and cannot be renamed.");
  },
});

export const removeLibraryPack = mutation({
  args: {
    libraryQuery: v.string(),
  },
  handler: async (ctx, { libraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);
    const existingAccount = await getOwnerLibraryPackAccount(
      ctx,
      ownerId,
      libraryQueryKey,
    );

    if (!existingAccount) {
      await deleteOwnerLibraryPackPhotoExclusions(
        ctx,
        ownerId,
        libraryQueryKey,
      );

      return {
        count: 0,
      };
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    const count = await removeOwnerLibraryPackAccount(
      ctx,
      ownerId,
      libraryQueryKey,
    );

    return {
      count,
    };
  },
});
