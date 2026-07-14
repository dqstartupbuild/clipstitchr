const minimumWebhookEventAt = Date.UTC(2000, 0, 1);
const maximumWebhookClockSkewMs = 5 * 60 * 1_000;

export function getLoopsWebhookEventAt(
  eventTime: number,
  receivedAt: number,
) {
  if (
    !Number.isSafeInteger(eventTime) ||
    !Number.isSafeInteger(receivedAt)
  ) {
    return null;
  }

  const eventAt = eventTime * 1_000;

  return Number.isSafeInteger(eventAt) &&
    eventAt >= minimumWebhookEventAt &&
    eventAt <= receivedAt + maximumWebhookClockSkewMs
    ? eventAt
    : null;
}
