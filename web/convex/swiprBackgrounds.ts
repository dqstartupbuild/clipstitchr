import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { logConvexTransactionMetrics } from "./logConvexTransactionMetrics";
import { rateLimiter } from "./rateLimiter";
import { upsertPexelsPackSummary } from "./upsertPexelsPackSummary";
import { upsertSwiprBackgroundCard } from "./upsertSwiprBackgroundCard";
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
const LIBRARY_PACK_ACCOUNT_LIMIT = 100;
const GLOBAL_PEXELS_BACKGROUND_LOOKUP_LIMIT = 500;
const GLOBAL_PEXELS_PACK_SUMMARY_LIMIT = 250;
const SWIPR_REFERENCED_BACKGROUND_LOOKUP_LIMIT = 100;
const SWIPR_LIBRARY_OWNED_BACKGROUND_LIMIT = 72;
const SWIPR_LIBRARY_PACK_ACCOUNT_LIMIT = 12;
const SWIPR_LIBRARY_PACK_BACKGROUND_LIMIT = 24;
const LIBRARY_PACK_EXCLUSION_PER_QUERY_LIMIT = 250;
const LIBRARY_PACK_EXCLUSION_DELETE_LIMIT = 1000;
const LIBRARY_QUERY_KEY_LOOKUP_LIMIT = 20;
const PEXELS_PHOTO_ID_LOOKUP_LIMIT = 120;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function getIsGlobalPexelsPackBackground(background: {
  libraryQueryKey?: string;
  libraryQuery?: string;
  source: string;
}) {
  return (
    background.source === "pexels" &&
    Boolean(background.libraryQueryKey || background.libraryQuery)
  );
}

function getBackgroundLibraryQueryKey(background: {
  libraryQueryKey?: string;
  libraryQuery?: string;
}) {
  return (
    background.libraryQueryKey ??
    normalizeSwiprLibraryQueryKey(background.libraryQuery)
  );
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
  limit = LIBRARY_PACK_ACCOUNT_LIMIT,
) {
  const packAccounts = await ctx.db
    .query("swiprLibraryPackAccounts")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .take(limit);

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
      getBackgroundLibraryQueryKey(background),
    );
  }

  return background.uploadedByOwnerId === ownerId;
}

async function getGlobalPexelsPackBackgrounds(
  ctx: MutationCtx | QueryCtx,
  limit = GLOBAL_PEXELS_BACKGROUND_LOOKUP_LIMIT,
) {
  return await ctx.db
    .query("swiprBackgroundCards")
    .withIndex("by_source_created", (q) => q.eq("source", "pexels"))
    .order("desc")
    .take(limit);
}

async function getGlobalPexelsPackByQueryKey(
  ctx: MutationCtx | QueryCtx,
  libraryQueryKey: string,
  limit = GLOBAL_PEXELS_BACKGROUND_LOOKUP_LIMIT,
) {
  const packBackgrounds = await ctx.db
    .query("swiprBackgroundCards")
    .withIndex("by_source_library_query_created", (q) =>
      q.eq("source", "pexels").eq("libraryQueryKey", libraryQueryKey),
    )
    .order("desc")
    .take(limit);
  const backgrounds =
    packBackgrounds.length > 0
      ? packBackgrounds
      : (await getGlobalPexelsPackBackgrounds(ctx, limit)).filter(
          (background) =>
            getBackgroundLibraryQueryKey(background) === libraryQueryKey,
        );

  return {
    backgrounds,
    libraryQuery: backgrounds[0]?.libraryQuery,
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

async function getOwnerLibraryPackPhotoExclusionBackgroundIdsForQueryKeys(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  libraryQueryKeys: Iterable<string>,
) {
  const normalizedKeys = Array.from(new Set(libraryQueryKeys)).filter(Boolean);

  if (!normalizedKeys.length) {
    return new Set<string>();
  }

  const exclusions = (
    await Promise.all(
      normalizedKeys.map((libraryQueryKey) =>
        ctx.db
          .query("swiprLibraryPackPhotoExclusions")
          .withIndex("by_owner_query", (q) =>
            q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
          )
          .take(LIBRARY_PACK_EXCLUSION_PER_QUERY_LIMIT),
      ),
    )
  ).flat();

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
    .take(LIBRARY_PACK_EXCLUSION_DELETE_LIMIT);

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
    const ownerLibraryPackAccountKeys = await getOwnerLibraryPackAccountKeys(
      ctx,
      ownerId,
      SWIPR_LIBRARY_PACK_ACCOUNT_LIMIT,
    );
    const excludedBackgroundIds =
      await getOwnerLibraryPackPhotoExclusionBackgroundIdsForQueryKeys(
        ctx,
        ownerId,
        ownerLibraryPackAccountKeys,
      );
    const ownedBackgrounds = await ctx.db
      .query("swiprBackgroundCards")
      .withIndex("by_uploaded_owner_created", (q) =>
        q.eq("uploadedByOwnerId", ownerId),
      )
      .order("desc")
      .take(SWIPR_LIBRARY_OWNED_BACKGROUND_LIMIT);
    const packBackgrounds = (
      await Promise.all(
        [...ownerLibraryPackAccountKeys].map((libraryQueryKey) =>
          ctx.db
            .query("swiprBackgroundCards")
            .withIndex("by_source_library_query_created", (q) =>
              q.eq("source", "pexels").eq("libraryQueryKey", libraryQueryKey),
            )
            .order("desc")
            .take(SWIPR_LIBRARY_PACK_BACKGROUND_LIMIT),
        ),
      )
    ).flat();
    const backgroundsById = new Map(
      [...ownedBackgrounds, ...packBackgrounds].map((background) => [
        background.id,
        background,
      ]),
    );

    const backgrounds = [...backgroundsById.values()]
      .filter(
        (background) =>
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
    await logConvexTransactionMetrics(ctx, "swiprBackgrounds.list");

    return backgrounds;
  },
});

export const listGlobalPexelsPackSummaries = query({
  args: {
    accountOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { accountOnly = false }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const ownerLibraryPackAccountKeysPromise =
      getOwnerLibraryPackAccountKeys(ctx, ownerId);
    const globalSummariesPromise = accountOnly
      ? null
      : ctx.db
          .query("swiprPexelsPackSummaries")
          .withIndex("by_updated")
          .order("desc")
          .take(GLOBAL_PEXELS_PACK_SUMMARY_LIMIT);
    const ownerLibraryPackAccountKeys =
      await ownerLibraryPackAccountKeysPromise;
    const summaries = accountOnly
      ? (
          await Promise.all(
            [...ownerLibraryPackAccountKeys].map((libraryQueryKey) =>
              ctx.db
                .query("swiprPexelsPackSummaries")
                .withIndex("by_library_query_key", (q) =>
                  q.eq("libraryQueryKey", libraryQueryKey),
                )
                .unique(),
            ),
          )
        ).filter((summary) => summary !== null)
      : (await globalSummariesPromise) ?? [];
    const photoExclusions = (
      await Promise.all(
        [...ownerLibraryPackAccountKeys].map((libraryQueryKey) =>
          ctx.db
            .query("swiprLibraryPackPhotoExclusions")
            .withIndex("by_owner_query", (q) =>
              q.eq("ownerId", ownerId).eq("libraryQueryKey", libraryQueryKey),
            )
            .take(LIBRARY_PACK_EXCLUSION_PER_QUERY_LIMIT),
        ),
      )
    ).flat();
    const excludedIdsByPackKey = new Map<string, Set<string>>();

    for (const exclusion of photoExclusions) {
      const excludedIds =
        excludedIdsByPackKey.get(exclusion.libraryQueryKey) ??
        new Set<string>();

      excludedIds.add(exclusion.backgroundId);
      excludedIdsByPackKey.set(exclusion.libraryQueryKey, excludedIds);
    }

    await logConvexTransactionMetrics(
      ctx,
      "swiprBackgrounds.listGlobalPexelsPackSummaries",
    );

    return summaries.map((summary) => {
      const isInAccount = ownerLibraryPackAccountKeys.has(
        summary.libraryQueryKey,
      );
      const excludedIds = excludedIdsByPackKey.get(summary.libraryQueryKey);

      return {
        ...summary,
        accountCovers:
          isInAccount && excludedIds
            ? summary.covers.filter(
                (cover) => !excludedIds.has(cover.backgroundId),
              )
            : summary.covers,
        accountPhotoCount:
          isInAccount && excludedIds
            ? Math.max(0, summary.photoCount - excludedIds.size)
            : summary.photoCount,
        isInAccount,
      };
    });
  },
});

export const listGlobalPexelsPack = query({
  args: {
    applyAccountExclusions: v.boolean(),
    libraryQuery: v.string(),
  },
  handler: async (ctx, { applyAccountExclusions, libraryQuery }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(libraryQuery);

    if (!libraryQueryKey) {
      return [];
    }

    const [pack, ownerLibraryPackAccountKeys, excludedBackgroundIds] =
      await Promise.all([
        getGlobalPexelsPackByQueryKey(
          ctx,
          libraryQueryKey,
          GLOBAL_PEXELS_BACKGROUND_LOOKUP_LIMIT,
        ),
        getOwnerLibraryPackAccountKeys(ctx, ownerId),
        applyAccountExclusions
          ? getOwnerLibraryPackPhotoExclusionBackgroundIdsForQueryKeys(
              ctx,
              ownerId,
              [libraryQueryKey],
            )
          : Promise.resolve(new Set<string>()),
      ]);

    if (
      applyAccountExclusions &&
      !ownerLibraryPackAccountKeys.has(libraryQueryKey)
    ) {
      return [];
    }

    await logConvexTransactionMetrics(
      ctx,
      "swiprBackgrounds.listGlobalPexelsPack",
    );

    return pack.backgrounds
      .filter(
        (background) =>
          !applyAccountExclusions || !excludedBackgroundIds.has(background.id),
      )
      .map((background) => ({
        ...background,
        isOwnedByCurrentUser: background.uploadedByOwnerId === ownerId,
      }));
  },
});

export const listByLibraryQueryKeys = query({
  args: {
    libraryQueryKeys: v.array(v.string()),
  },
  handler: async (ctx, { libraryQueryKeys }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedKeys = Array.from(
      new Set(
        libraryQueryKeys
          .map(normalizeSwiprLibraryQueryKey)
          .filter((key): key is string => Boolean(key)),
      ),
    ).slice(0, LIBRARY_QUERY_KEY_LOOKUP_LIMIT);

    if (!normalizedKeys.length) {
      return [];
    }

    const ownerLibraryPackAccountKeys = await getOwnerLibraryPackAccountKeys(
      ctx,
      ownerId,
    );
    const excludedBackgroundIds =
      await getOwnerLibraryPackPhotoExclusionBackgroundIdsForQueryKeys(
        ctx,
        ownerId,
        normalizedKeys,
      );
    const backgrounds = (
      await Promise.all(
        normalizedKeys.map((libraryQueryKey) =>
          ctx.db
            .query("swiprBackgroundCards")
            .withIndex("by_source_library_query_created", (q) =>
              q.eq("source", "pexels").eq("libraryQueryKey", libraryQueryKey),
            )
            .order("desc")
            .take(GLOBAL_PEXELS_BACKGROUND_LOOKUP_LIMIT),
        ),
      )
    ).flat();

    return backgrounds
      .filter(
        (background) =>
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

export const listByIds = query({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, { ids }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const uniqueIds = Array.from(
      new Set(ids.map((id) => id.trim()).filter(Boolean)),
    ).slice(0, SWIPR_REFERENCED_BACKGROUND_LOOKUP_LIMIT);

    if (!uniqueIds.length) {
      return [];
    }

    const backgrounds = await Promise.all(
      uniqueIds.map((id) =>
        ctx.db
          .query("swiprBackgroundCards")
          .withIndex("by_background_id", (q) => q.eq("id", id))
          .unique(),
      ),
    );

    return backgrounds
      .filter(
        (background): background is NonNullable<(typeof backgrounds)[number]> =>
          Boolean(background),
      )
      .filter(
        (background) =>
          background.uploadedByOwnerId === ownerId ||
          getIsGlobalPexelsPackBackground(background),
      )
      .map((background) => ({
        ...background,
        isOwnedByCurrentUser: background.uploadedByOwnerId === ownerId,
      }));
  },
});

export const getExistingPexelsPhotoIds = query({
  args: {
    photoIds: v.array(v.number()),
  },
  handler: async (ctx, { photoIds }) => {
    await getAuthenticatedOwnerId(ctx);
    const uniquePhotoIds = Array.from(new Set(photoIds))
      .filter((photoId) => Number.isFinite(photoId))
      .slice(0, PEXELS_PHOTO_ID_LOOKUP_LIMIT);
    const matches = await Promise.all(
      uniquePhotoIds.map((photoId) =>
        ctx.db
          .query("swiprBackgroundCards")
          .withIndex("by_source_pexels_photo", (q) =>
            q.eq("source", "pexels").eq("pexelsPhotoId", photoId),
          )
          .first(),
      ),
    );

    return matches
      .filter(
        (background): background is NonNullable<(typeof matches)[number]> =>
          Boolean(background),
      )
      .map((background) => background.pexelsPhotoId)
      .filter((photoId): photoId is number => typeof photoId === "number");
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
  libraryQueryKey: v.optional(v.string()),
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
      normalizeAutomationSwiprSelectedLibraryPackNames(libraryPackNames)
        .map(normalizeSwiprLibraryQueryKey)
        .filter((key): key is string => Boolean(key)),
    );
    const ownerLibraryPackAccountKeys = await getOwnerLibraryPackAccountKeys(
      ctx,
      ownerId,
    );
    const excludedBackgroundIds =
      await getOwnerLibraryPackPhotoExclusionBackgroundIdsForQueryKeys(
        ctx,
        ownerId,
        selectedPackKeys,
      );

    if (selectedPackKeys.size === 0) {
      return [];
    }

    const backgrounds = (
      await Promise.all(
        [...selectedPackKeys].map((libraryQueryKey) =>
          getGlobalPexelsPackByQueryKey(ctx, libraryQueryKey),
        ),
      )
    ).flatMap((pack) => pack.backgrounds);

    return backgrounds.filter(
      (background) =>
        getBackgroundBelongsToOwnerPack(
          background,
          ownerId,
          ownerLibraryPackAccountKeys,
        ) &&
        !excludedBackgroundIds.has(background.id) &&
        getIsGlobalPexelsPackBackground(background) &&
        selectedPackKeys.has(getBackgroundLibraryQueryKey(background)),
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

    const normalizedLibraryQuery = args.libraryQuery
      ? normalizeText(args.libraryQuery, BACKGROUND_LIBRARY_QUERY_MAX_LENGTH)
      : undefined;
    const libraryQueryKey =
      args.libraryQueryKey ??
      (normalizedLibraryQuery
        ? normalizeSwiprLibraryQueryKey(normalizedLibraryQuery)
        : undefined);
    const backgroundFields = {
      uploadedByOwnerId: ownerId,
      ...args,
      name,
      description: args.description
        ? normalizeText(args.description, BACKGROUND_DESCRIPTION_MAX_LENGTH)
        : undefined,
      details: args.details
        ? normalizeText(args.details, BACKGROUND_DETAILS_MAX_LENGTH)
        : undefined,
      libraryQuery: normalizedLibraryQuery,
      libraryQueryKey,
    };
    const backgroundDocumentId = await ctx.db.insert(
      "swiprBackgrounds",
      backgroundFields,
    );
    await upsertSwiprBackgroundCard(ctx, backgroundFields);
    await upsertPexelsPackSummary(ctx, backgroundFields);

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

    const normalizedLibraryQuery = args.libraryQuery
      ? normalizeText(args.libraryQuery, BACKGROUND_LIBRARY_QUERY_MAX_LENGTH)
      : undefined;
    const libraryQueryKey =
      args.libraryQueryKey ??
      (normalizedLibraryQuery
        ? normalizeSwiprLibraryQueryKey(normalizedLibraryQuery)
        : undefined);
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
      libraryQuery: normalizedLibraryQuery,
      libraryQueryKey,
    });
    const insertedBackground = await ctx.db.get(backgroundDocumentId);

    if (insertedBackground) {
      await upsertSwiprBackgroundCard(ctx, insertedBackground);
      await upsertPexelsPackSummary(ctx, insertedBackground);
    }

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
    const libraryQueryKey = normalizeSwiprLibraryQueryKey(
      normalizedLibraryQuery,
    );

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
    await deleteOwnerLibraryPackPhotoExclusions(ctx, ownerId, libraryQueryKey);

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
