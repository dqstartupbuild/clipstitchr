export function getHookLabParsedString(
  value: unknown,
  fallback = "",
  maxLength = 2_000,
) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) || fallback
    : fallback;
}
