export function normalizeBoundedCount(value: number, max: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.floor(value), 0), max);
}
