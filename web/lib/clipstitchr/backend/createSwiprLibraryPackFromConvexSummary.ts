import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

export function createSwiprLibraryPackFromConvexSummary(
  summary: Doc<"swiprPexelsPackSummaries"> & {
    accountCovers?: Doc<"swiprPexelsPackSummaries">["covers"];
    accountPhotoCount?: number;
    isInAccount?: boolean;
  },
): SwiprLibraryPack {
  return {
    accountCount: summary.accountPhotoCount,
    accountCovers: summary.accountCovers,
    count: summary.photoCount,
    coverBackgroundIds: summary.covers.map((cover) => cover.backgroundId),
    covers: summary.covers,
    isInAccount: summary.isInAccount,
    name: summary.libraryQuery,
  };
}
