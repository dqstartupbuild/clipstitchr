import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";
import { getActiveQueueableStitches } from "./getActiveQueueableStitches.js";

export function getLatestQueueableStitch(stitches: LibraryStitchSummary[]) {
  const [latest] = getActiveQueueableStitches(stitches);

  if (!latest) {
    throw new Error(
      "No ready active Stitches found. Create or render a Stitch in the dashboard first.",
    );
  }

  return latest;
}
