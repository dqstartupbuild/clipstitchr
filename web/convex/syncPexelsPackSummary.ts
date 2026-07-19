import type { MutationCtx } from "./_generated/server";
import { createPexelsPackSummaryCover } from "./createPexelsPackSummaryCover";

const PEXELS_PACK_BACKGROUND_LIMIT = 2000;
const PEXELS_PACK_COVER_LIMIT = 4;

export async function syncPexelsPackSummary(
  ctx: MutationCtx,
  libraryQueryKey: string,
) {
  const backgrounds = await ctx.db
    .query("swiprBackgroundCards")
    .withIndex("by_source_library_query_created", (q) =>
      q.eq("source", "pexels").eq("libraryQueryKey", libraryQueryKey),
    )
    .order("desc")
    .take(PEXELS_PACK_BACKGROUND_LIMIT);
  const existingSummary = await ctx.db
    .query("swiprPexelsPackSummaries")
    .withIndex("by_library_query_key", (q) =>
      q.eq("libraryQueryKey", libraryQueryKey),
    )
    .unique();
  const libraryQuery = backgrounds[0]?.libraryQuery;

  if (!backgrounds.length || !libraryQuery) {
    if (existingSummary) {
      await ctx.db.delete(existingSummary._id);
    }

    return null;
  }

  const fields = {
    libraryQuery,
    libraryQueryKey,
    photoCount: backgrounds.length,
    covers: backgrounds
      .slice(0, PEXELS_PACK_COVER_LIMIT)
      .map(createPexelsPackSummaryCover),
    updatedAt: backgrounds[0].createdAt,
  };

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("swiprPexelsPackSummaries", fields);
}
