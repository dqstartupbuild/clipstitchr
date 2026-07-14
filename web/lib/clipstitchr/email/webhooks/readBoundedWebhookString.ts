export function readBoundedWebhookString(
  value: unknown,
  maximumLength: number,
) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength
    ? value
    : null;
}
