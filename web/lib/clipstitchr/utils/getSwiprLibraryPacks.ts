import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

export function getSwiprLibraryPacks(
  backgrounds: SwiprBackgroundAsset[],
): SwiprLibraryPack[] {
  const packsByName = new Map<string, SwiprLibraryPack>();

  for (const background of backgrounds) {
    if (background.source !== "pexels" || !background.libraryQuery) {
      continue;
    }

    const existingPack = packsByName.get(background.libraryQuery);
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

    packsByName.set(pack.name, pack);
  }

  return [...packsByName.values()];
}
