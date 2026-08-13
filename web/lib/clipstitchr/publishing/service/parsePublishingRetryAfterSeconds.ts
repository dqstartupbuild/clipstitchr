export function parsePublishingRetryAfterSeconds(value: string | null) {
  if (value === null || !/^\d+$/.test(value)) {
    return undefined;
  }

  const seconds = Number(value);

  return Number.isSafeInteger(seconds) && seconds >= 1 && seconds <= 86_400
    ? seconds
    : undefined;
}
