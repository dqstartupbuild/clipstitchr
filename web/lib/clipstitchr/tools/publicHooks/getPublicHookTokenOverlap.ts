import { getPublicHookWords } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookWords";

export function getPublicHookTokenOverlap(left: string, right: string) {
  const leftWords = new Set(getPublicHookWords(left));
  const rightWords = new Set(getPublicHookWords(right));

  if (!leftWords.size || !rightWords.size) {
    return 0;
  }

  const sharedCount = Array.from(leftWords).filter((word) =>
    rightWords.has(word),
  ).length;

  return sharedCount / Math.min(leftWords.size, rightWords.size);
}
