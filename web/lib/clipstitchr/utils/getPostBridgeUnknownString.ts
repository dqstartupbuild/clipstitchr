export function getPostBridgeUnknownString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
