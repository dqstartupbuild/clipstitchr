export function getSocialPublishingUnknownString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
