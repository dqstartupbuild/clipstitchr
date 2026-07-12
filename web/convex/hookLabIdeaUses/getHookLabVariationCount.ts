export function getHookLabVariationCount(value: number) {
  if (value === 1 || value === 3 || value === 5) {
    return value;
  }

  throw new Error("Choose 1, 3, or 5 versions.");
}
