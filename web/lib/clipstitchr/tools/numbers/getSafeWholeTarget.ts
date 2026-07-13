export function getSafeWholeTarget(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return Math.ceil(value);
}
