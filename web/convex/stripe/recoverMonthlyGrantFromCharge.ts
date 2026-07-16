import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { reconcileDailyDraftsAfterPlanChange } from "../automation/reconcileDailyDraftsAfterPlanChange";
import { reconcileProductsAfterPlanChange } from "../products/reconcileProductsAfterPlanChange";
import { grantMonthlyAllowance } from "../usage/grantMonthlyAllowance";
import { getExpandedStripeChargeInvoice } from "./getExpandedStripeChargeInvoice";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";
import { getStripeResourceId } from "./getStripeResourceId";

export async function recoverMonthlyGrantFromCharge(
  ctx: MutationCtx,
  charge: Stripe.Charge,
  ownerId: string,
) {
  const invoice = getExpandedStripeChargeInvoice(charge);

  if (!invoice || invoice.status !== "paid") {
    throw new Error("Paid Stripe invoice recovery context is unavailable.");
  }

  const snapshot = getStripeInvoiceSnapshot(invoice);
  const chargeCustomerId = getStripeResourceId(charge.customer);

  if (
    snapshot.customerId !== chargeCustomerId ||
    (snapshot.ownerId && snapshot.ownerId !== ownerId)
  ) {
    throw new Error("Paid Stripe invoice recovery owner does not match.");
  }

  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (!entitlement || entitlement.stripeCustomerId !== snapshot.customerId) {
    throw new Error("Paid Stripe invoice recovery entitlement is unavailable.");
  }

  const paidAt = invoice.status_transitions.paid_at ?? invoice.created;
  const paidAtIso = new Date(paidAt * 1_000).toISOString();
  const recoveryEventId = `stripe-recovery:invoice:${snapshot.invoiceId}`;
  const result = await grantMonthlyAllowance(ctx, {
    eventId: recoveryEventId,
    invoiceId: snapshot.invoiceId,
    now: paidAtIso,
    ownerId,
    periodEnd: snapshot.periodEnd,
    periodStart: snapshot.periodStart,
    planKey: snapshot.planKey,
    stripeChargeId: charge.id,
    stripePaymentIntentId: getStripeResourceId(charge.payment_intent),
    stripeSubscriptionId: snapshot.subscriptionId,
  });

  if (
    entitlement.latestPaidInvoiceId === snapshot.invoiceId &&
    entitlement.stripeSubscriptionId === snapshot.subscriptionId
  ) {
    await reconcileProductsAfterPlanChange(ctx, {
      eventId: recoveryEventId,
      now: paidAtIso,
      ownerId,
      planKey: snapshot.planKey,
    });
    await reconcileDailyDraftsAfterPlanChange(ctx, {
      eventId: recoveryEventId,
      now: paidAtIso,
      ownerId,
      planKey: snapshot.planKey,
    });
  }

  return result;
}
