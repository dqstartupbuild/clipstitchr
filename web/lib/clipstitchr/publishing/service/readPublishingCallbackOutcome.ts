export function readPublishingCallbackOutcome(
  value: unknown,
): "cancelled" | "connected" {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("outcome" in value) ||
    (value.outcome !== "cancelled" && value.outcome !== "connected")
  ) {
    throw new TypeError("Publishing callback returned an invalid response.");
  }

  return value.outcome;
}
