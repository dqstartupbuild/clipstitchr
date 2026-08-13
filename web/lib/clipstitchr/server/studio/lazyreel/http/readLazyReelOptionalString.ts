export function readLazyReelOptionalString(
  value: unknown,
  name: string,
  maximumLength: number,
) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maximumLength) {
    throw new Error(`${name} is too long.`);
  }

  return normalized;
}
