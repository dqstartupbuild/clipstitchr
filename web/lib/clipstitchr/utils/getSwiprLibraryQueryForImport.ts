import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";
import { normalizeSwiprLibraryQueryName } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryName";

type SwiprLibraryQueryBackground = {
  libraryQuery?: string;
  source?: string;
};

export function getSwiprLibraryQueryForImport(
  backgrounds: SwiprLibraryQueryBackground[],
  query: string,
) {
  const queryKey = normalizeSwiprLibraryQueryKey(query);
  const existingPack = backgrounds.find(
    (background) =>
      background.source === "pexels" &&
      normalizeSwiprLibraryQueryKey(background.libraryQuery) === queryKey,
  );

  return existingPack?.libraryQuery ?? normalizeSwiprLibraryQueryName(query);
}
