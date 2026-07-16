import type Stripe from "stripe";
import { attachStripeChargeInvoice } from "./attachStripeChargeInvoice";
import { getStripeChargeInvoiceId } from "./getStripeChargeInvoiceId";
import { getStripeResourceId } from "./getStripeResourceId";

export async function attachStripeChargeRecoveryContext(
  stripe: Pick<Stripe, "invoicePayments" | "invoices" | "paymentIntents">,
  charge: Stripe.Charge,
) {
  const chargeWithInvoice = await attachStripeChargeInvoice(stripe, charge);
  const invoiceId = getStripeChargeInvoiceId(chargeWithInvoice);
  const paymentIntentId = getStripeResourceId(charge.payment_intent);
  const [invoice, paymentIntent] = await Promise.all([
    invoiceId ? stripe.invoices.retrieve(invoiceId) : undefined,
    paymentIntentId
      ? stripe.paymentIntents.retrieve(paymentIntentId)
      : undefined,
  ]);

  return {
    ...chargeWithInvoice,
    ...(invoice ? { invoice } : {}),
    ...(paymentIntent ? { payment_intent: paymentIntent } : {}),
  } as Stripe.Charge;
}
