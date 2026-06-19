import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

export function filterPexelsLibraryPacksBySearchQuery(
  packs: SwiprLibraryPack[],
  searchQuery: string,
) {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return packs;
  }

  return packs.filter((pack) => pack.name.toLowerCase().includes(query));
}
