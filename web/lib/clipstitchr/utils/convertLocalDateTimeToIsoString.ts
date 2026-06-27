export function convertLocalDateTimeToIsoString(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new Error("Choose a time to schedule this post.");
  }

  return new Date(timestamp).toISOString();
}
