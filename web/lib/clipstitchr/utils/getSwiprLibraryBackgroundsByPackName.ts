import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export function getSwiprLibraryBackgroundsByPackName(
  backgrounds: SwiprBackgroundAsset[],
  packName: string,
) {
  const packKey = normalizeSwiprLibraryQueryKey(packName);

  return backgrounds.filter(
    (background) =>
      background.source === "pexels" &&
      normalizeSwiprLibraryQueryKey(background.libraryQuery) === packKey,
  );
}
