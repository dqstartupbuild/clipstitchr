import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export function getSwiprLibraryPacks(
  backgrounds: SwiprBackgroundAsset[],
): SwiprLibraryPack[] {
  const packsByName = new Map<string, SwiprLibraryPack>();

  for (const background of backgrounds) {
    if (background.source !== "pexels" || !background.libraryQuery) {
      continue;
    }

    const packKey = normalizeSwiprLibraryQueryKey(background.libraryQuery);
    const existingPack = packsByName.get(packKey);
    const pack =
      existingPack ??
      ({
        count: 0,
        coverBackgroundIds: [],
        name: background.libraryQuery,
      } satisfies SwiprLibraryPack);

    pack.count += 1;

    if (pack.coverBackgroundIds.length < 4) {
      pack.coverBackgroundIds.push(background.id);
    }

    packsByName.set(packKey, pack);
  }

  return [...packsByName.values()];
}
