export function getClerkWebhookEventAt(timestampHeader: string) {
  if (!/^\d{1,16}$/.test(timestampHeader)) return null;

  const timestampSeconds = Number(timestampHeader);
  const eventAt = timestampSeconds * 1_000;

  return Number.isSafeInteger(eventAt) && eventAt > 0 ? eventAt : null;
}
