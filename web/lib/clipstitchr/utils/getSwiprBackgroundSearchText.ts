import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

export function getSwiprBackgroundSearchText(background: SwiprBackgroundAsset) {
  if (background.searchText) {
    return background.searchText.toLowerCase();
  }

  return [
    background.name,
    background.description,
    background.details,
    ...background.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
