import type { MutationCtx } from "./_generated/server";

export async function listRecentVideoClipsByLibraryKind(
  ctx: MutationCtx,
  {
    libraryKind,
    limit,
    ownerId,
    productId,
  }: {
    libraryKind: "demo" | "ugc";
    limit: number;
    ownerId: string;
    productId?: string;
  },
) {
  if (productId) {
    return await ctx.db
      .query("videoClips")
      .withIndex("by_owner_product_library_kind_created", (q) =>
        q
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("libraryKind", libraryKind),
      )
      .order("desc")
      .take(limit);
  }

  return await ctx.db
    .query("videoClips")
    .withIndex("by_owner_library_kind_created", (q) =>
      q.eq("ownerId", ownerId).eq("libraryKind", libraryKind),
    )
    .order("desc")
    .take(limit);
}
