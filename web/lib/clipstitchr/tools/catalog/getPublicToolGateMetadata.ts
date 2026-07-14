import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { publicToolGateCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolGateCatalog";

export function getPublicToolGateMetadata(key: PublicToolKey) {
  return publicToolGateCatalog[key];
}
