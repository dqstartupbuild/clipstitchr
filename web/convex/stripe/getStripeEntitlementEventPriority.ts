import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";

export function getStripeEntitlementEventPriority({
  eventType,
  state,
}: {
  eventType: string;
  state: EntitlementState;
}) {
  if (
    eventType === "customer.deleted" ||
    eventType === "customer.subscription.deleted"
  ) {
    return 50;
  }

  if (eventType === "invoice.paid") {
    return 40;
  }

  if (
    eventType === "invoice.finalization_failed" ||
    eventType === "invoice.payment_failed" ||
    state === "grace"
  ) {
    return 30;
  }

  return state === "active" ? 20 : 10;
}
