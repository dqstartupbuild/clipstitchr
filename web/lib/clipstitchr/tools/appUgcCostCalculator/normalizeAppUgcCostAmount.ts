export function normalizeAppUgcCostAmount(value: number, max: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(Math.min(Math.max(value, 0), max) * 100) / 100;
}
