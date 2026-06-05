import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";

export function getClipLibraryDisplayCounts(
  aggregateCounts: ClipLibraryCounts | undefined,
  loadedCounts: ClipLibraryCounts,
): ClipLibraryCounts {
  if (!aggregateCounts) {
    return loadedCounts;
  }

  return {
    activeStitches: Math.max(
      aggregateCounts.activeStitches ?? 0,
      loadedCounts.activeStitches,
    ),
    cliprClips: Math.max(aggregateCounts.cliprClips, loadedCounts.cliprClips),
    demoClips: Math.max(aggregateCounts.demoClips, loadedCounts.demoClips),
    postedStitches: Math.max(
      aggregateCounts.postedStitches ?? 0,
      loadedCounts.postedStitches,
    ),
    stitches: Math.max(aggregateCounts.stitches, loadedCounts.stitches),
    swapClips: Math.max(aggregateCounts.swapClips, loadedCounts.swapClips),
    ugcClips: Math.max(aggregateCounts.ugcClips, loadedCounts.ugcClips),
  };
}
