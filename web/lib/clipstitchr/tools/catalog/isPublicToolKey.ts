import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export function isPublicToolKey(value: string): value is PublicToolKey {
  return (publicToolKeys as readonly string[]).includes(value);
}
