export function createUsagePeriodKey(
  stripeSubscriptionId: string,
  periodStart: string,
) {
  return `${stripeSubscriptionId}:${periodStart}`;
}
