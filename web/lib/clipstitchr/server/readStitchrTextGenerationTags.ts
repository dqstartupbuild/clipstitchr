import { readStitchrTextGenerationString } from "@/lib/clipstitchr/server/readStitchrTextGenerationString";

const maxTags = 8;

export function readStitchrTextGenerationTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tag) => readStitchrTextGenerationString(tag, 40))
    .filter(Boolean)
    .slice(0, maxTags);
}
