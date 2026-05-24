import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import { getCliprContentTypeLabel } from "@/lib/clipstitchr/utils/getCliprContentTypeLabel";

export function getCliprContentTypeTag(contentType: CliprContentType) {
  return getCliprContentTypeLabel(contentType).toLowerCase().replace(/\W+/g, "-");
}
