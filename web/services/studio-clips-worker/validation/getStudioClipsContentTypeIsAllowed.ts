export function getStudioClipsContentTypeIsAllowed(
  value: unknown,
  allowed: readonly string[],
): value is string {
  return typeof value === "string" && allowed.includes(value);
}
