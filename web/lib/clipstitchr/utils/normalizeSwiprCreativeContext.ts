import { SWIPR_CREATIVE_CONTEXT_MAX_LENGTH } from "@/lib/clipstitchr/constants/swiprCreativeContextMaxLength";

export function normalizeSwiprCreativeContext(value: unknown) {
  return typeof value === "string"
    ? value.trim().slice(0, SWIPR_CREATIVE_CONTEXT_MAX_LENGTH)
    : "";
}
