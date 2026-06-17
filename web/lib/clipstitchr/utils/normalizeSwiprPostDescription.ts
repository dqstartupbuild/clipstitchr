import {
  SWIPR_POST_DESCRIPTION_MAX_LENGTH,
  SWIPR_POST_DESCRIPTION_MIN_LENGTH,
} from "@/lib/clipstitchr/constants/swiprPostDescriptionLengthBounds";

export function normalizeSwiprPostDescription({
  fallback,
  value,
}: {
  fallback: string;
  value: unknown;
}) {
  const text =
    typeof value === "string"
      ? value
          .trim()
          .replace(/[ \t]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
      : "";
  const description =
    text.length >= SWIPR_POST_DESCRIPTION_MIN_LENGTH ? text : fallback;

  return description
    .trim()
    .slice(0, SWIPR_POST_DESCRIPTION_MAX_LENGTH)
    .trim();
}
