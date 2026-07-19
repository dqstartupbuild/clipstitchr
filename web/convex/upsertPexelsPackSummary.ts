import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createPexelsPackSummaryCover } from "./createPexelsPackSummaryCover";

const PEXELS_PACK_COVER_LIMIT = 4;

export async function upsertPexelsPackSummary(
  ctx: MutationCtx,
  background: Pick<
    Doc<"swiprBackgroundCards">,
    | "createdAt"
    | "id"
    | "imageObject"
    | "libraryQuery"
    | "libraryQueryKey"
    | "source"
  >,
) {
  if (
    background.source !== "pexels" ||
    !background.libraryQuery ||
    !background.libraryQueryKey
  ) {
    return null;
  }

  const libraryQueryKey = background.libraryQueryKey;
  const existingSummary = await ctx.db
    .query("swiprPexelsPackSummaries")
    .withIndex("by_library_query_key", (q) =>
      q.eq("libraryQueryKey", libraryQueryKey),
    )
    .unique();
  const covers = existingSummary?.covers.some(
    (cover) => cover.backgroundId === background.id,
  )
    ? existingSummary.covers
    : [
        ...(existingSummary?.covers ?? []),
        createPexelsPackSummaryCover(background),
      ].slice(0, PEXELS_PACK_COVER_LIMIT);
  const fields = {
    libraryQuery: background.libraryQuery,
    libraryQueryKey,
    photoCount: (existingSummary?.photoCount ?? 0) + 1,
    covers,
    updatedAt: background.createdAt,
  };

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("swiprPexelsPackSummaries", fields);
}
