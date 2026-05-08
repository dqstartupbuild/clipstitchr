import { normalizeAssetTag } from "@/lib/clipstitchr/utils/normalizeAssetTag";

export function normalizeAssetTags(tags: string[]) {
  const normalizedTags = new Set<string>();

  for (const tag of tags) {
    const normalizedTag = normalizeAssetTag(tag);

    if (normalizedTag) {
      normalizedTags.add(normalizedTag);
    }

    if (normalizedTags.size >= 8) {
      break;
    }
  }

  return Array.from(normalizedTags);
}
