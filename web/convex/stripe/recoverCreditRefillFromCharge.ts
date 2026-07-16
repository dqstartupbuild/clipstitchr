import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getExpandedStripeChargePaymentIntent } from "./getExpandedStripeChargePaymentIntent";
import { getStripeResourceId } from "./getStripeResourceId";
import { grantConfirmedCreditRefill } from "./grantConfirmedCreditRefill";

export async function recoverCreditRefillFromCharge(
  ctx: MutationCtx,
  event: Stripe.Event,
  charge: Stripe.Charge,
) {
  const paymentIntent = getExpandedStripeChargePaymentIntent(charge);

  if (
    !paymentIntent ||
    getStripeResourceId(paymentIntent.latest_charge) !== charge.id
  ) {
    throw new Error("Stripe refill recovery context is unavailable.");
  }

  const recoveryEvent = {
    ...event,
    id: `stripe-recovery:payment-intent:${paymentIntent.id}`,
    type: "payment_intent.succeeded",
  } as Stripe.Event;
  const grantId = await grantConfirmedCreditRefill(
    ctx,
    recoveryEvent,
    paymentIntent,
    { allowBillingReviewForRecovery: true },
  );

  if (!grantId) {
    throw new Error("Stripe refill recovery did not create a grant.");
  }

  return grantId;
}
