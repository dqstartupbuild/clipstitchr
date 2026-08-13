export function assertStudioReelPositiveInteger(
  value: number,
  label: string,
  maximum: number,
) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${label} must be a whole number from 1 through ${maximum}.`);
  }

  return value;
}
