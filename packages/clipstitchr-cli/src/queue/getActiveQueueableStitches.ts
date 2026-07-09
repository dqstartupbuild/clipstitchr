import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";

export function getActiveQueueableStitches(stitches: LibraryStitchSummary[]) {
  return stitches.filter((stitch) => {
    return !stitch.isPosted && stitch.hasRenderedVideo;
  });
}
