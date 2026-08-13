export function clampLazyReelLimit(
  value: number | undefined,
  fallback: number,
  maximum: number,
) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(value), 1), maximum);
}
