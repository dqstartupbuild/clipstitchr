import {
  SWIPR_POST_DESCRIPTION_MAX_LENGTH,
} from "@/lib/clipstitchr/constants/swiprPostDescriptionLengthBounds";
import { sanitizeGeneratedLongFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedLongFormText";

export function normalizeSwiprPostDescription({
  fallback,
  value,
}: {
  fallback: string;
  value: unknown;
}) {
  return sanitizeGeneratedLongFormText({
    fallback,
    maxLength: SWIPR_POST_DESCRIPTION_MAX_LENGTH,
    text: typeof value === "string" ? value : "",
  });
}
