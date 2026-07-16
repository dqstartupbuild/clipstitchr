export function getClerkOwnerId(value: unknown) {
  return typeof value === "string" && value.trim() && value.length <= 256
    ? value.trim()
    : undefined;
}
