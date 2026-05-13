import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function getRecentSwiprSwipes(
  swipes: SwiprSwipe[],
  limit: number,
) {
  return [...swipes]
    .sort(
      (firstSwipe, secondSwipe) =>
        new Date(secondSwipe.updatedAt).getTime() -
        new Date(firstSwipe.updatedAt).getTime(),
    )
    .slice(0, limit);
}
