import { normalizeAssetTag } from "@/lib/clipstitchr/utils/normalizeAssetTag";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

export function normalizeAssetTagsWithRequiredTag(
  tags: string[],
  requiredTag: string,
) {
  const normalizedRequiredTag = normalizeAssetTag(requiredTag);

  if (!normalizedRequiredTag) {
    return normalizeAssetTags(tags);
  }

  return normalizeAssetTags([normalizedRequiredTag, ...tags]);
}
