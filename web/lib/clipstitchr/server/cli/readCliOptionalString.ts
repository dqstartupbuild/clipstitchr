export function readCliOptionalString(
  body: Record<string, unknown>,
  key: string,
) {
  const value = body[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
