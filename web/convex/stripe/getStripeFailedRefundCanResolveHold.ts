import type Stripe from "stripe";

export function getStripeFailedRefundCanResolveHold(charge: Stripe.Charge) {
  return charge.amount_refunded === 0 && !charge.refunded;
}
