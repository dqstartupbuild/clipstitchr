import type { MutationCtx } from "../_generated/server";

export async function getStripePaymentHasOpenHold(
  ctx: MutationCtx,
  args: { invoiceId?: string; paymentIntentId?: string },
) {
  const paymentIntentHolds = args.paymentIntentId
    ? await ctx.db
        .query("stripePaymentHolds")
        .withIndex("by_payment_intent_status", (query) =>
          query
            .eq("stripePaymentIntentId", args.paymentIntentId)
            .eq("status", "open"),
        )
        .collect()
    : [];

  if (paymentIntentHolds.length > 0) {
    return true;
  }

  const invoiceHolds = args.invoiceId
    ? await ctx.db
        .query("stripePaymentHolds")
        .withIndex("by_invoice_status", (query) =>
          query.eq("stripeInvoiceId", args.invoiceId).eq("status", "open"),
        )
        .collect()
    : [];

  return invoiceHolds.length > 0;
}
