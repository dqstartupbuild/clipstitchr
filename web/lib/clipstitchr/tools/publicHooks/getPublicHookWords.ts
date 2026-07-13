import { publicHookStopWords } from "@/lib/clipstitchr/tools/publicHooks/publicHookStopWords";

export function getPublicHookWords(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^['-]+|['-]+$/g, ""))
    .filter((word) => word.length > 2 && !publicHookStopWords.has(word));
}
