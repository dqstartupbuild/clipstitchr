import type { MutationCtx } from "./_generated/server";

export async function listRecentVideoClipsByLibraryKind(
  ctx: MutationCtx,
  {
    libraryKind,
    limit,
    ownerId,
  }: {
    libraryKind: "demo" | "ugc";
    limit: number;
    ownerId: string;
  },
) {
  return await ctx.db
    .query("videoClips")
    .withIndex("by_owner_library_kind_created", (q) =>
      q.eq("ownerId", ownerId).eq("libraryKind", libraryKind),
    )
    .order("desc")
    .take(limit);
}
