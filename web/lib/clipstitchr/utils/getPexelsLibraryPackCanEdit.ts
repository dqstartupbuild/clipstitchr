import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export function getPexelsLibraryPackCanEdit(
  backgrounds: SwiprBackgroundAsset[],
  packName: string,
) {
  const packKey = normalizeSwiprLibraryQueryKey(packName);
  const packBackgrounds = backgrounds.filter(
    (background) =>
      normalizeSwiprLibraryQueryKey(background.libraryQuery) === packKey,
  );

  return (
    packBackgrounds.length > 0 &&
    packBackgrounds.every((background) => background.isOwnedByCurrentUser)
  );
}
