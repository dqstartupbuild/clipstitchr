export function pickLazyReelValue<T>(values: readonly T[], seed: number, offset = 0) {
  return values[(seed + offset) % values.length];
}
