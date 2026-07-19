import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

export function getAccountSwiprLibraryPacks(
  packs: SwiprLibraryPack[],
): SwiprLibraryPack[] {
  return packs
    .filter((pack) => pack.isInAccount)
    .map((pack) => ({
      ...pack,
      count: pack.accountCount ?? pack.count,
      coverBackgroundIds:
        pack.accountCovers?.map((cover) => cover.backgroundId) ??
        pack.coverBackgroundIds,
      covers: pack.accountCovers ?? pack.covers,
    }));
}
