import type Stripe from "stripe";
import { getStripeResourceId } from "./getStripeResourceId";

export function getStripeChargeInvoiceId(charge: Stripe.Charge) {
  const invoice = (
    charge as Stripe.Charge & {
      invoice?: string | { id: string } | null;
    }
  ).invoice;

  return getStripeResourceId(invoice);
}
