import type Stripe from "stripe";
import { getStripeChargeInvoiceId } from "./getStripeChargeInvoiceId";
import { getStripeResourceId } from "./getStripeResourceId";

export async function attachStripeChargeInvoice(
  stripe: Pick<Stripe, "invoicePayments">,
  charge: Stripe.Charge,
) {
  if (getStripeChargeInvoiceId(charge)) {
    return charge;
  }

  const paymentIntentId = getStripeResourceId(charge.payment_intent);

  if (!paymentIntentId) {
    return charge;
  }

  const invoicePayments = await stripe.invoicePayments.list({
    limit: 2,
    payment: { payment_intent: paymentIntentId, type: "payment_intent" },
  });
  const invoiceIds = [
    ...new Set(
      invoicePayments.data.map((invoicePayment) =>
        getStripeResourceId(invoicePayment.invoice),
      ),
    ),
  ].filter((invoiceId): invoiceId is string => Boolean(invoiceId));

  if (invoiceIds.length !== 1) {
    return charge;
  }

  return { ...charge, invoice: invoiceIds[0] } as Stripe.Charge;
}
