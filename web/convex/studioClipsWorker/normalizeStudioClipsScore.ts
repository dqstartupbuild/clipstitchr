export function normalizeStudioClipsScore(
  value: number | undefined,
  label: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be between 0 and 100.`);
  }
  return value;
}
