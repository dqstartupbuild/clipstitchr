import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";
import type { LibrarySwipeSummary } from "../library/LibrarySwipeSummary.js";
import type { QueueContentItem } from "./QueueContentItem.js";
import { shuffleQueueContentItems } from "./shuffleQueueContentItems.js";

type CreateMixedQueueContentItemsOptions = {
  random?: () => number;
  stitches: LibraryStitchSummary[];
  swipes: LibrarySwipeSummary[];
};

export function createMixedQueueContentItems({
  random,
  stitches,
  swipes,
}: CreateMixedQueueContentItemsOptions): QueueContentItem[] {
  return shuffleQueueContentItems(
    [
      ...stitches.map((stitch) => ({
        item: stitch,
        type: "stitch" as const,
      })),
      ...swipes.map((swipe) => ({
        item: swipe,
        type: "swipe" as const,
      })),
    ],
    random,
  );
}
