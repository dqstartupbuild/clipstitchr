export function getPlanChangeCreditAdjustment({
  currentCredits,
  nextCredits,
  now,
  periodEnd,
  periodStart,
}: {
  currentCredits: number;
  nextCredits: number;
  now: string;
  periodEnd: string;
  periodStart: string;
}) {
  const difference = Math.max(0, nextCredits - currentCredits);
  const periodStartMs = Date.parse(periodStart);
  const periodEndMs = Date.parse(periodEnd);
  const nowMs = Date.parse(now);
  const periodDuration = periodEndMs - periodStartMs;

  if (!difference || periodDuration <= 0) {
    return 0;
  }

  const remainingFraction = Math.min(
    1,
    Math.max(0, periodEndMs - nowMs) / periodDuration,
  );

  return Math.floor(difference * remainingFraction);
}
