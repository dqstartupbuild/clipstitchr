import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";
import type { LibrarySwipeSummary } from "../library/LibrarySwipeSummary.js";

export type QueueContentItem =
  | {
      item: LibraryStitchSummary;
      type: "stitch";
    }
  | {
      item: LibrarySwipeSummary;
      type: "swipe";
    };
