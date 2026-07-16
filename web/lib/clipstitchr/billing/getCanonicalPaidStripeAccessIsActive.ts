import type { EntitlementState } from "./types/EntitlementState";

export function getCanonicalPaidStripeAccessIsActive(
  entitlement: {
    billingReviewRequired: boolean;
    currentPeriodEnd: string;
    currentPeriodStart: string;
    state: EntitlementState;
  },
  now: string,
) {
  const nowMs = Date.parse(now);
  const periodStartMs = Date.parse(entitlement.currentPeriodStart);
  const periodEndMs = Date.parse(entitlement.currentPeriodEnd);

  return (
    entitlement.state === "active" &&
    !entitlement.billingReviewRequired &&
    Number.isFinite(nowMs) &&
    Number.isFinite(periodStartMs) &&
    Number.isFinite(periodEndMs) &&
    periodStartMs <= nowMs &&
    nowMs < periodEndMs
  );
}
