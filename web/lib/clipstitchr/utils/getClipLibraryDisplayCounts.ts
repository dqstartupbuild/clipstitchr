import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";

export function getClipLibraryDisplayCounts(
  aggregateCounts: ClipLibraryCounts | undefined,
  loadedCounts: ClipLibraryCounts,
): ClipLibraryCounts {
  if (!aggregateCounts) {
    return {
      ...loadedCounts,
      cliprClips: 0,
      ugcClips: loadedCounts.ugcClips + loadedCounts.cliprClips,
    };
  }

  const aggregateUgcClips = aggregateCounts.ugcClips + aggregateCounts.cliprClips;
  const loadedUgcClips = loadedCounts.ugcClips + loadedCounts.cliprClips;

  return {
    activeStitches: Math.max(
      aggregateCounts.activeStitches ?? 0,
      loadedCounts.activeStitches,
    ),
    cliprClips: 0,
    demoClips: Math.max(aggregateCounts.demoClips, loadedCounts.demoClips),
    postedStitches: Math.max(
      aggregateCounts.postedStitches ?? 0,
      loadedCounts.postedStitches,
    ),
    stitches: Math.max(aggregateCounts.stitches, loadedCounts.stitches),
    swapClips: Math.max(aggregateCounts.swapClips, loadedCounts.swapClips),
    ugcClips: Math.max(aggregateUgcClips, loadedUgcClips),
  };
}
