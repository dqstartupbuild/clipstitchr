import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getStripeChargeInvoiceId } from "./getStripeChargeInvoiceId";
import { getExpandedStripeChargeInvoice } from "./getExpandedStripeChargeInvoice";
import { getExpandedStripeChargePaymentIntent } from "./getExpandedStripeChargePaymentIntent";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";
import { getStripeResourceId } from "./getStripeResourceId";

export async function getStripeChargeBillingContext(
  ctx: MutationCtx,
  charge: Stripe.Charge,
) {
  const customerId = getStripeResourceId(charge.customer);
  const invoiceId = getStripeChargeInvoiceId(charge);
  const paymentIntentId = getStripeResourceId(charge.payment_intent);
  const invoice = getExpandedStripeChargeInvoice(charge);
  const paymentIntent = getExpandedStripeChargePaymentIntent(charge);
  const checkoutIntentId = paymentIntent?.metadata.checkoutIntentId?.trim();
  const refillCheckout = checkoutIntentId
    ? await ctx.db
        .query("billingCheckoutSessions")
        .withIndex("by_checkout_intent", (query) =>
          query.eq("checkoutIntentId", checkoutIntentId),
        )
        .unique()
    : null;
  const paymentIntentGrants = paymentIntentId
    ? await ctx.db
        .query("creditGrants")
        .withIndex("by_payment_intent", (query) =>
          query.eq("stripePaymentIntentId", paymentIntentId),
        )
        .collect()
    : [];
  const grants =
    paymentIntentGrants.length > 0 || !invoiceId
      ? paymentIntentGrants
      : await ctx.db
          .query("creditGrants")
          .withIndex("by_invoice", (query) =>
            query.eq("stripeInvoiceId", invoiceId),
          )
          .collect();
  const entitlement = customerId
    ? await ctx.db
        .query("billingEntitlements")
        .withIndex("by_stripe_customer", (query) =>
          query.eq("stripeCustomerId", customerId),
        )
        .unique()
    : null;
  const ownerIds = new Set([
    ...grants.map((grant) => grant.ownerId),
    ...(entitlement ? [entitlement.ownerId] : []),
    ...(invoice
      ? [getStripeInvoiceSnapshot(invoice).ownerId].filter(
          (ownerId): ownerId is string => Boolean(ownerId),
        )
      : []),
    ...(refillCheckout ? [refillCheckout.ownerId] : []),
    ...(refillCheckout && paymentIntent?.metadata.ownerId?.trim()
      ? [paymentIntent.metadata.ownerId.trim()]
      : []),
  ]);

  if (
    paymentIntent?.metadata.catalogKey === "creation-credit-refill" &&
    (!refillCheckout ||
      refillCheckout.mode !== "payment" ||
      refillCheckout.catalogKey !== "creation-credit-refill")
  ) {
    throw new Error("Stripe refill Checkout owner could not be verified.");
  }

  if (!customerId || ownerIds.size !== 1) {
    throw new Error("Stripe charge owner could not be resolved safely.");
  }

  return {
    customerId,
    entitlement,
    grants,
    invoiceId,
    ownerId: [...ownerIds][0]!,
    paymentIntentId,
    refillCheckout,
  };
}
