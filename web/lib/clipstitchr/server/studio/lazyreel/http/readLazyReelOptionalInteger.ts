export function readLazyReelOptionalInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number,
) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (!Number.isInteger(value) || Number(value) < minimum || Number(value) > maximum) {
    throw new Error(`${name} must be a whole number from ${minimum} to ${maximum}.`);
  }

  return Number(value);
}
