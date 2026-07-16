import type Stripe from "stripe";
import { getPlanKeyForStripePrice } from "../../lib/clipstitchr/billing/getPlanKeyForStripePrice";
import { getStripeResourceId } from "./getStripeResourceId";
import { toStripeIsoString } from "./toStripeIsoString";

export function getStripeInvoiceSnapshot(invoice: Stripe.Invoice) {
  const subscriptionDetails = invoice.parent?.subscription_details;
  const metadata = subscriptionDetails?.metadata ?? invoice.metadata ?? {};
  const planLines = invoice.lines.data.flatMap((candidate) => {
    const linePrice = candidate.pricing?.price_details?.price;
    const linePriceId = getStripeResourceId(linePrice);
    const linePlanKey = linePriceId
      ? getPlanKeyForStripePrice(linePriceId)
      : undefined;

    return linePriceId && linePlanKey
      ? [{ line: candidate, planKey: linePlanKey, priceId: linePriceId }]
      : [];
  });
  const selected = [...planLines].sort((left, right) => {
    const leftPositive = left.line.amount > 0 ? 1 : 0;
    const rightPositive = right.line.amount > 0 ? 1 : 0;

    if (leftPositive !== rightPositive) {
      return rightPositive - leftPositive;
    }

    return right.line.amount - left.line.amount;
  })[0];
  const line = selected?.line;
  const priceId = line
    ? getStripeResourceId(line.pricing?.price_details?.price)
    : undefined;
  const planKey = selected?.planKey;
  const subscriptionId = getStripeResourceId(
    subscriptionDetails?.subscription ?? line?.subscription,
  );
  const customerId = getStripeResourceId(invoice.customer);
  const ownerId = metadata.ownerId?.trim();

  if (!line || !priceId || !planKey || !subscriptionId || !customerId) {
    throw new Error("Stripe invoice is missing ClipStitchr billing data.");
  }

  return {
    billingReason: invoice.billing_reason,
    customerId,
    invoiceId: invoice.id,
    ownerId: ownerId || undefined,
    periodEnd: toStripeIsoString(line.period.end),
    periodStart: toStripeIsoString(invoice.period_start),
    planKey,
    priceId,
    subscriptionId,
  };
}
