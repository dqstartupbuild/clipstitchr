export function readLazyReelRequiredString(
  value: unknown,
  name: string,
  maximumLength: number,
) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    throw new Error(`${name} is required.`);
  }

  if (normalized.length > maximumLength) {
    throw new Error(`${name} is too long.`);
  }

  return normalized;
}
