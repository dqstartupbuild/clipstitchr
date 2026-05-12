import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";

export function sanitizeCliprGeneratedText(text: string, fallback: string) {
  const trimmedText = text.trim().replace(/\s+/g, " ");

  if (!trimmedText || getCliprTextHasForbiddenCta(trimmedText)) {
    return getCliprTextHasForbiddenCta(fallback)
      ? "A small mistake is easier to fix early"
      : fallback;
  }

  return trimmedText.slice(0, 240);
}
