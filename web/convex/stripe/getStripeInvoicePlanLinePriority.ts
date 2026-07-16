import type Stripe from "stripe";

export function getStripeInvoicePlanLinePriority(
  line: Stripe.InvoiceLineItem,
) {
  const subscriptionItemDetails = line.parent?.subscription_item_details;
  const invoiceItemDetails = line.parent?.invoice_item_details;
  const creditedItems =
    subscriptionItemDetails?.proration_details?.credited_items ??
    invoiceItemDetails?.proration_details?.credited_items;

  return creditedItems ? 0 : 1;
}
