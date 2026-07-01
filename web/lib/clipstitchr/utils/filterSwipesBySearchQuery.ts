import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function filterSwipesBySearchQuery(
  swipes: SwiprSwipe[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return swipes;
  }

  return swipes.filter((swipe) => {
    const searchText =
      swipe.searchText ??
      [
        swipe.name,
        swipe.productName,
        swipe.productContext,
        swipe.caption,
        swipe.description,
        swipe.hashtags?.join(" "),
        swipe.rationale,
        swipe.socialCaption,
        ...swipe.slides.map((slide) => slide.textOverlay.text),
      ]
        .join(" ")
        .toLowerCase();

    return searchText.toLowerCase().includes(normalizedSearchQuery);
  });
}
