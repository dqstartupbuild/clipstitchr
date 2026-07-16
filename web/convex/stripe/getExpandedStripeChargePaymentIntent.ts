import type Stripe from "stripe";

export function getExpandedStripeChargePaymentIntent(charge: Stripe.Charge) {
  return charge.payment_intent && typeof charge.payment_intent !== "string"
    ? charge.payment_intent
    : undefined;
}
