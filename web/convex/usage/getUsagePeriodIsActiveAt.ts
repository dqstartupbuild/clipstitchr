export function getUsagePeriodIsActiveAt(
  period: { periodEnd: string; periodStart: string },
  now: string,
) {
  const nowMs = Date.parse(now);
  const periodStartMs = Date.parse(period.periodStart);
  const periodEndMs = Date.parse(period.periodEnd);

  return (
    Number.isFinite(nowMs) &&
    Number.isFinite(periodStartMs) &&
    Number.isFinite(periodEndMs) &&
    periodStartMs <= nowMs &&
    nowMs < periodEndMs
  );
}
