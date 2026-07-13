import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export function getPublicToolDefinition(key: PublicToolKey) {
  return publicToolCatalog[key];
}
