export function getPostBridgeScheduledAtLabel(value: unknown) {
  if (typeof value !== "string") {
    return "No time set";
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "No time set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
