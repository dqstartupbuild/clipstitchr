import { createPublicVideoExamplePath } from "@/lib/clipstitchr/example-outputs/createPublicVideoExamplePath";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";
import { createCanonicalUrl } from "@/lib/site";

export function createPublicVideoExampleUrl(example: PublicVideoExample) {
  return createCanonicalUrl(createPublicVideoExamplePath(example));
}
