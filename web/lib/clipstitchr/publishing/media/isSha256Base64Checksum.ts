export function isSha256Base64Checksum(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9+/]{43}=$/.test(value) &&
    value.length === 44
  );
}
