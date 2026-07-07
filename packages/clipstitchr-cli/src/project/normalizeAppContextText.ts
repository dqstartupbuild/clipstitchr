export function normalizeAppContextText(value: string) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}
