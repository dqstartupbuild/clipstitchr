export function normalizeBlueprintCount(
  value: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(maximum, Math.max(0, Math.floor(value)));
}
