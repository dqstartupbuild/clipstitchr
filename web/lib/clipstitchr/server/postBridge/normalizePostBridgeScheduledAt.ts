export function normalizePostBridgeScheduledAt(value: string) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new Error("Choose a time to schedule this post.");
  }

  if (timestamp <= Date.now()) {
    throw new Error("Choose a future time to schedule this post.");
  }

  return new Date(timestamp).toISOString();
}
