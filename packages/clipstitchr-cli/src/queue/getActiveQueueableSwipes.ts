import type { LibrarySwipeSummary } from "../library/LibrarySwipeSummary.js";

export function getActiveQueueableSwipes(swipes: LibrarySwipeSummary[]) {
  return swipes.filter((swipe) => {
    return !swipe.isPosted && swipe.hasRenderedImage;
  });
}
