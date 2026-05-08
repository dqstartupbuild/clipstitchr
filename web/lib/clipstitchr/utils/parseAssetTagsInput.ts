import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

export function parseAssetTagsInput(input: string) {
  return normalizeAssetTags(input.split(/[\n,]+/));
}
