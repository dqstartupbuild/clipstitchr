import { getGeneratedTextHasAiSlop } from "@/lib/clipstitchr/utils/getGeneratedTextHasAiSlop";
import { normalizeGeneratedTextPunctuation } from "@/lib/clipstitchr/utils/normalizeGeneratedTextPunctuation";

export function sanitizeGeneratedShortFormText({
  fallback,
  maxLength,
  text,
}: {
  fallback: string;
  maxLength: number;
  text: string;
}) {
  const normalizedText = normalizeGeneratedTextPunctuation(text)
    .trim()
    .replace(/\s+/g, " ");
  const normalizedFallback = normalizeGeneratedTextPunctuation(fallback)
    .trim()
    .replace(/\s+/g, " ");
  const acceptedText =
    normalizedText && !getGeneratedTextHasAiSlop(normalizedText)
      ? normalizedText
      : normalizedFallback;

  return acceptedText.slice(0, maxLength).trim();
}
