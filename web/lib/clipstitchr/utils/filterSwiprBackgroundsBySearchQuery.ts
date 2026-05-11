import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import { getSwiprBackgroundSearchText } from "@/lib/clipstitchr/utils/getSwiprBackgroundSearchText";

export function filterSwiprBackgroundsBySearchQuery(
  backgrounds: SwiprBackgroundAsset[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return backgrounds;
  }

  return backgrounds.filter((background) =>
    getSwiprBackgroundSearchText(background).includes(normalizedSearchQuery),
  );
}
