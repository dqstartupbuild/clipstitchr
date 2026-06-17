import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function filterSwipesBySearchQuery(
  swipes: SwiprSwipe[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return swipes;
  }

  return swipes.filter((swipe) =>
    [
      swipe.name,
      swipe.productName,
      swipe.productContext,
      swipe.caption,
      swipe.hashtags?.join(" "),
      swipe.rationale,
      ...swipe.slides.map((slide) => slide.textOverlay.text),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearchQuery),
  );
}
