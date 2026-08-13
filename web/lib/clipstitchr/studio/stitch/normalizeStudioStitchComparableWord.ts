export function normalizeStudioStitchComparableWord(word: string): string {
  return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}
