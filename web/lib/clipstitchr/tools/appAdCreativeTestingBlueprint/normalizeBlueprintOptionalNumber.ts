export function normalizeBlueprintOptionalNumber(
  value: number | null,
  maximum: number,
): number | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(maximum, Math.max(0, value));
}
