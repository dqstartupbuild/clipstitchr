import { normalizeSwiprLibraryQueryKey } from "./normalizeSwiprLibraryQueryKey";

export function getIsSwiprPackSelected(
  packName: string,
  selectedPackNames: string[],
) {
  const packKey = normalizeSwiprLibraryQueryKey(packName);

  return selectedPackNames.some(
    (selectedPackName) =>
      normalizeSwiprLibraryQueryKey(selectedPackName) === packKey,
  );
}
