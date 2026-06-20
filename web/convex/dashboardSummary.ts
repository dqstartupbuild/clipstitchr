import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const RECENT_ITEM_LIMIT = 4;
const SOURCE_CLIP_LIMIT = 30;

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

function dedupeVideoClips(clips: Doc<"videoClips">[]) {
  return [...new Map(clips.map((clip) => [clip.id, clip])).values()];
}

async function takeVideoClipsByLibraryKind(
  ctx: QueryCtx,
  ownerId: string,
  kind: Doc<"videoClips">["libraryKind"],
  productId: string | undefined,
  limit: number,
) {
  if (productId) {
    return await ctx.db
      .query("videoClips")
      .withIndex("by_owner_product_library_kind_created", (q) =>
        q
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("libraryKind", kind),
      )
      .order("desc")
      .take(limit);
  }

  return await ctx.db
    .query("videoClips")
    .withIndex("by_owner_library_kind_created", (q) =>
      q.eq("ownerId", ownerId).eq("libraryKind", kind),
    )
    .order("desc")
    .take(limit);
}

async function takeAccountUgcVideoClips(
  ctx: QueryCtx,
  ownerId: string,
  limit: number,
) {
  return await ctx.db
    .query("videoClips")
    .withIndex("by_owner_product_library_kind_created", (q) =>
      q
        .eq("ownerId", ownerId)
        .eq("productId", undefined)
        .eq("libraryKind", "ugc"),
    )
    .order("desc")
    .take(limit);
}

async function getRecentVideoClips(
  ctx: QueryCtx,
  ownerId: string,
  productId: string | undefined,
) {
  if (!productId) {
    return await ctx.db
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(RECENT_ITEM_LIMIT);
  }

  const [productClips, accountUgcClips] = await Promise.all([
    ctx.db
      .query("videoClips")
      .withIndex("by_owner_product_created", (q) =>
        q.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("desc")
      .take(RECENT_ITEM_LIMIT),
    takeAccountUgcVideoClips(ctx, ownerId, RECENT_ITEM_LIMIT),
  ]);

  return sortByCreatedAtDesc(
    dedupeVideoClips([...productClips, ...accountUgcClips]),
  ).slice(0, RECENT_ITEM_LIMIT);
}

async function getStitchrSourceClips(
  ctx: QueryCtx,
  ownerId: string,
  productId: string | undefined,
) {
  const [productUgcClips, accountUgcClips, cliprClips, swaprClips] =
    await Promise.all([
      productId
        ? takeVideoClipsByLibraryKind(
            ctx,
            ownerId,
            "ugc",
            productId,
            SOURCE_CLIP_LIMIT,
          )
        : Promise.resolve([]),
      productId
        ? takeAccountUgcVideoClips(ctx, ownerId, SOURCE_CLIP_LIMIT)
        : takeVideoClipsByLibraryKind(
            ctx,
            ownerId,
            "ugc",
            undefined,
            SOURCE_CLIP_LIMIT,
          ),
      takeVideoClipsByLibraryKind(
        ctx,
        ownerId,
        "clipr",
        productId,
        SOURCE_CLIP_LIMIT,
      ),
      takeVideoClipsByLibraryKind(
        ctx,
        ownerId,
        "swapr",
        productId,
        SOURCE_CLIP_LIMIT,
      ),
    ]);

  return dedupeVideoClips([
    ...productUgcClips,
    ...accountUgcClips,
    ...cliprClips,
    ...swaprClips,
  ]);
}

async function getRecentStitches(
  ctx: QueryCtx,
  ownerId: string,
  productId: string | undefined,
) {
  if (productId) {
    return await ctx.db
      .query("stitches")
      .withIndex("by_owner_product_is_posted_created", (q) =>
        q
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("isPosted", undefined),
      )
      .order("desc")
      .take(RECENT_ITEM_LIMIT);
  }

  return await ctx.db
    .query("stitches")
    .withIndex("by_owner_is_posted_created", (q) =>
      q.eq("ownerId", ownerId).eq("isPosted", undefined),
    )
    .order("desc")
    .take(RECENT_ITEM_LIMIT);
}

async function getRecentSwipes(
  ctx: QueryCtx,
  ownerId: string,
  productId: string | undefined,
) {
  if (productId) {
    return await ctx.db
      .query("swipes")
      .withIndex("by_owner_product_is_posted_updated", (q) =>
        q
          .eq("ownerId", ownerId)
          .eq("productSourceId", productId)
          .eq("isPosted", undefined),
      )
      .order("desc")
      .take(RECENT_ITEM_LIMIT);
  }

  return await ctx.db
    .query("swipes")
    .withIndex("by_owner_is_posted_updated", (q) =>
      q.eq("ownerId", ownerId).eq("isPosted", undefined),
    )
    .order("desc")
    .take(RECENT_ITEM_LIMIT);
}

async function getSwipeBackgrounds(ctx: QueryCtx, swipes: Doc<"swipes">[]) {
  const backgroundIds = [
    ...new Set(swipes.map((swipe) => swipe.backgroundId).filter(Boolean)),
  ];
  const backgrounds = await Promise.all(
    backgroundIds.map((backgroundId) =>
      ctx.db
        .query("swiprBackgrounds")
        .withIndex("by_background_id", (q) => q.eq("id", backgroundId))
        .unique(),
    ),
  );

  return backgrounds.filter(
    (background): background is Doc<"swiprBackgrounds"> => Boolean(background),
  );
}

export const get = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;
    const [
      recentUploads,
      recentStitches,
      demoClips,
      stitchrUgcSourceClips,
      recentSwipes,
    ] = await Promise.all([
      getRecentVideoClips(ctx, ownerId, productFilterId),
      getRecentStitches(ctx, ownerId, productFilterId),
      takeVideoClipsByLibraryKind(
        ctx,
        ownerId,
        "demo",
        productFilterId,
        SOURCE_CLIP_LIMIT,
      ),
      getStitchrSourceClips(ctx, ownerId, productFilterId),
      getRecentSwipes(ctx, ownerId, productFilterId),
    ]);
    const swipeBackgrounds = await getSwipeBackgrounds(ctx, recentSwipes);

    return {
      demoClips,
      recentStitches,
      recentSwipes,
      recentUploads,
      stitchrUgcSourceClips,
      swipeBackgrounds,
    };
  },
});
