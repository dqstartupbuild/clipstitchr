export function normalizeLazyReelText(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}
