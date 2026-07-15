import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";
import { getGeneratedTextHasAiSlop } from "@/lib/clipstitchr/utils/getGeneratedTextHasAiSlop";
import { normalizeGeneratedTextPunctuation } from "@/lib/clipstitchr/utils/normalizeGeneratedTextPunctuation";

export function sanitizeCliprGeneratedText(text: string, fallback: string) {
  const trimmedText = normalizeGeneratedTextPunctuation(text)
    .trim()
    .replace(/\s+/g, " ");
  const trimmedFallback = normalizeGeneratedTextPunctuation(fallback)
    .trim()
    .replace(/\s+/g, " ");

  if (
    !trimmedText ||
    getCliprTextHasForbiddenCta(trimmedText) ||
    getGeneratedTextHasAiSlop(trimmedText)
  ) {
    return getCliprTextHasForbiddenCta(trimmedFallback) ||
      getGeneratedTextHasAiSlop(trimmedFallback)
      ? "Keep the next point specific"
      : trimmedFallback;
  }

  return trimmedText.slice(0, 240);
}
