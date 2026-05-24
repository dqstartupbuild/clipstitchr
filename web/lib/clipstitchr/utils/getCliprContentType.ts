import { defaultCliprContentType } from "@/lib/clipstitchr/constants/defaultCliprContentType";
import { cliprContentTypeOptions } from "@/lib/clipstitchr/constants/cliprContentTypeOptions";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";

export function getCliprContentType(value: unknown): CliprContentType {
  return typeof value === "string" &&
    cliprContentTypeOptions.some((option) => option.id === value)
    ? (value as CliprContentType)
    : defaultCliprContentType;
}
