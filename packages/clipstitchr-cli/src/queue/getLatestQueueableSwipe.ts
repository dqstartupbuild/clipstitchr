import type { LibrarySwipeSummary } from "../library/LibrarySwipeSummary.js";
import { getActiveQueueableSwipes } from "./getActiveQueueableSwipes.js";

export function getLatestQueueableSwipe(swipes: LibrarySwipeSummary[]) {
  const [latest] = getActiveQueueableSwipes(swipes);

  if (!latest) {
    throw new Error(
      "No ready active Swipes found. Save a Swipe with photos in the dashboard first.",
    );
  }

  return latest;
}
