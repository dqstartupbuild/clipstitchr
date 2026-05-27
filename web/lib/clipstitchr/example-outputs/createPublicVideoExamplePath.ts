import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";

export function createPublicVideoExamplePath(example: PublicVideoExample) {
  return `/examples/${example.slug}`;
}
