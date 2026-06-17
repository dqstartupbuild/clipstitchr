export function readSwiprPexelsImportCount(value: unknown) {
  const count = typeof value === "number" ? value : 24;

  return Math.max(1, Math.min(40, Math.round(count)));
}
