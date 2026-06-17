export function readSwiprDraftGenerationCount(value: unknown) {
  const count = typeof value === "number" ? value : 3;

  return Math.max(1, Math.min(10, Math.round(count)));
}
