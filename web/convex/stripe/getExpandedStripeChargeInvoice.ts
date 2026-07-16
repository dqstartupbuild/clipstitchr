import type Stripe from "stripe";

export function getExpandedStripeChargeInvoice(charge: Stripe.Charge) {
  const invoice = (
    charge as Stripe.Charge & {
      invoice?: string | Stripe.Invoice | null;
    }
  ).invoice;

  return invoice && typeof invoice !== "string" ? invoice : undefined;
}
