import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { readStitchrTextGenerationString } from "@/lib/clipstitchr/server/readStitchrTextGenerationString";
import { readStitchrTextGenerationTags } from "@/lib/clipstitchr/server/readStitchrTextGenerationTags";

const maxClipContexts = 12;

export function readStitchrTextGenerationClipContexts(
  value: unknown,
): StitchrTextGenerationClipContext[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((entry): StitchrTextGenerationClipContext[] => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const source = entry as Record<string, unknown>;
      const role = source.role === "demo" ? "demo" : "ugc";
      const name = readStitchrTextGenerationString(source.name, 120);

      if (!name) {
        return [];
      }

      return [
        {
          id: readStitchrTextGenerationString(source.id, 120),
          role,
          name,
          libraryKind:
            source.libraryKind === "clipr" ||
            source.libraryKind === "demo" ||
            source.libraryKind === "swapr" ||
            source.libraryKind === "ugc"
              ? source.libraryKind
              : undefined,
          tags: readStitchrTextGenerationTags(source.tags),
          videoDescription: readStitchrTextGenerationString(
            source.videoDescription,
            600,
          ),
          mainPersonDescription: readStitchrTextGenerationString(
            source.mainPersonDescription,
            400,
          ),
          outfitDescription: readStitchrTextGenerationString(
            source.outfitDescription,
            300,
          ),
          locationDescription: readStitchrTextGenerationString(
            source.locationDescription,
            300,
          ),
          poseDescription: readStitchrTextGenerationString(
            source.poseDescription,
            300,
          ),
          productDescription: readStitchrTextGenerationString(
            source.productDescription,
            400,
          ),
        },
      ];
    })
    .slice(0, maxClipContexts);
}
