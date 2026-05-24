import { cliprContentTypeOptions } from "@/lib/clipstitchr/constants/cliprContentTypeOptions";
import { defaultCliprContentType } from "@/lib/clipstitchr/constants/defaultCliprContentType";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";

export function getCliprContentTypeLabel(contentType?: CliprContentType) {
  return (
    cliprContentTypeOptions.find((option) => option.id === contentType)
      ?.label ??
    cliprContentTypeOptions.find((option) => option.id === defaultCliprContentType)
      ?.label ??
    "Avatar Talking Head"
  );
}
