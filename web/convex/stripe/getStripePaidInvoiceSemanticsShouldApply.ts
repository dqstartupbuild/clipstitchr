import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";

export function getStripePaidInvoiceSemanticsShouldApply(
  current: {
    currentPeriodEnd: string;
    currentPeriodStart: string;
    latestPaidInvoiceId?: string;
    planKey: PlanKey;
    stripeSubscriptionId: string;
  },
  incoming: {
    invoiceId: string;
    periodEnd: string;
    periodStart: string;
    planKey: PlanKey;
    subscriptionId: string;
  },
) {
  if (current.latestPaidInvoiceId === incoming.invoiceId) {
    return false;
  }

  const currentPeriodStart = Date.parse(current.currentPeriodStart);
  const incomingPeriodStart = Date.parse(incoming.periodStart);

  if (
    !Number.isFinite(currentPeriodStart) ||
    !Number.isFinite(incomingPeriodStart)
  ) {
    return false;
  }

  if (current.stripeSubscriptionId !== incoming.subscriptionId) {
    return incomingPeriodStart >= currentPeriodStart;
  }

  if (incomingPeriodStart !== currentPeriodStart) {
    return incomingPeriodStart > currentPeriodStart;
  }

  if (incoming.planKey !== current.planKey) {
    return (
      getPlanPolicy(incoming.planKey).monthlyPriceUsd >
      getPlanPolicy(current.planKey).monthlyPriceUsd
    );
  }

  const currentPeriodEnd = Date.parse(current.currentPeriodEnd);
  const incomingPeriodEnd = Date.parse(incoming.periodEnd);

  return (
    Number.isFinite(currentPeriodEnd) &&
    Number.isFinite(incomingPeriodEnd) &&
    incomingPeriodEnd > currentPeriodEnd
  );
}
