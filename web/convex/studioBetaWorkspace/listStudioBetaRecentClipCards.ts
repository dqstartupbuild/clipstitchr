import type { QueryCtx } from "../_generated/server";

export async function listStudioBetaRecentClipCards(
  ctx: QueryCtx,
  ownerId: string,
  productId: string,
) {
  const [productClips, accountUgcClips] = await Promise.all([
    ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_product_created", (query) =>
        query.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("desc")
      .take(8),
    ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_product_library_kind_created", (query) =>
        query
          .eq("ownerId", ownerId)
          .eq("productId", undefined)
          .eq("libraryKind", "ugc"),
      )
      .order("desc")
      .take(8),
  ]);

  return [...new Map([...productClips, ...accountUgcClips].map((clip) => [clip.id, clip])).values()]
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 8);
}
