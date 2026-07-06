export function readCliPositiveNumber(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key];

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing ${label}.`);
  }

  return Math.ceil(value);
}
