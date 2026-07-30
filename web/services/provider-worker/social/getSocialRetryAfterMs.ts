const MAXIMUM_SOCIAL_RETRY_AFTER_MS = 10 * 60_000;

export function getSocialRetryAfterMs(
  value: string | null,
  nowMs = Date.now(),
) {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  const parsedMs = Number.isFinite(seconds)
    ? seconds * 1_000
    : Date.parse(value) - nowMs;

  if (!Number.isFinite(parsedMs) || parsedMs <= 0) {
    return undefined;
  }

  return Math.min(
    Math.max(Math.ceil(parsedMs), 1_000),
    MAXIMUM_SOCIAL_RETRY_AFTER_MS,
  );
}
