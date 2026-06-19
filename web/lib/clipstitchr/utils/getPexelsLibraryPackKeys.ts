import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export function getPexelsLibraryPackKeys(packs: SwiprLibraryPack[]) {
  return new Set(packs.map((pack) => normalizeSwiprLibraryQueryKey(pack.name)));
}
