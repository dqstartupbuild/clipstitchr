import type Stripe from "stripe";
import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";

export function getEntitlementStateForSubscriptionStatus(
  status: Stripe.Subscription.Status,
  hasConfirmedPayment: boolean,
): EntitlementState {
  if (status === "past_due") {
    return "grace";
  }

  if (status === "active" && hasConfirmedPayment) {
    return "active";
  }

  return "inactive";
}
