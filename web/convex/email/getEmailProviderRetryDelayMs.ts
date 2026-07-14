export function getEmailProviderRetryDelayMs(attemptCount: number) {
  const boundedAttempt = Math.max(1, Math.min(attemptCount, 7));
  return Math.min(30 * 60 * 1000, 15_000 * 2 ** (boundedAttempt - 1));
}
