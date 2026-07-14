import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export function getPublicToolGateMode(key: PublicToolKey) {
  return getPublicToolGateMetadata(key).mode;
}
