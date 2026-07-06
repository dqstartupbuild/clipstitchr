export function readCliRequiredString(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  return value.trim();
}
