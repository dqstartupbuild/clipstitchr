import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { grantMonthlyAllowance } from "../usage/grantMonthlyAllowance";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";
import { writeEntitlementHistory } from "./writeEntitlementHistory";
import { reconcileDailyDraftsAfterPlanChange } from "../automation/reconcileDailyDraftsAfterPlanChange";
import { reconcileProductsAfterPlanChange } from "../products/reconcileProductsAfterPlanChange";

export async function activateEntitlementFromInvoice(
  ctx: MutationCtx,
  event: Stripe.Event,
  invoice: Stripe.Invoice,
) {
  const snapshot = getStripeInvoiceSnapshot(invoice);
  const ownerId = await resolveStripeOwnerId(ctx, {
    customerId: snapshot.customerId,
    metadataOwnerId: snapshot.ownerId,
    subscriptionId: snapshot.subscriptionId,
  });
  const existing = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (existing && existing.latestPaymentEventCreatedAt > event.created) {
    return existing._id;
  }

  const now = new Date(event.created * 1_000).toISOString();

  await grantMonthlyAllowance(ctx, {
    eventId: event.id,
    invoiceId: snapshot.invoiceId,
    now,
    ownerId,
    periodEnd: snapshot.periodEnd,
    periodStart: snapshot.periodStart,
    planKey: snapshot.planKey,
    stripeSubscriptionId: snapshot.subscriptionId,
  });
  await reconcileProductsAfterPlanChange(ctx, {
    eventId: event.id,
    now,
    ownerId,
    planKey: snapshot.planKey,
  });
  await reconcileDailyDraftsAfterPlanChange(ctx, {
    eventId: event.id,
    now,
    ownerId,
    planKey: snapshot.planKey,
  });

  if (!existing) {
    const entitlementId = await ctx.db.insert("billingEntitlements", {
      billingReviewRequired: false,
      cancelAtPeriodEnd: false,
      createdAt: now,
      currentPeriodEnd: snapshot.periodEnd,
      currentPeriodStart: snapshot.periodStart,
      latestPaidInvoiceId: snapshot.invoiceId,
      latestPaymentEventCreatedAt: event.created,
      latestSubscriptionEventCreatedAt: 0,
      lastPaymentAt: now,
      ownerId,
      planKey: snapshot.planKey,
      sourceEventCreatedAt: event.created,
      sourceEventId: event.id,
      state: "active",
      stripeCustomerId: snapshot.customerId,
      stripePriceId: snapshot.priceId,
      stripeSubscriptionId: snapshot.subscriptionId,
      updatedAt: now,
      version: 1,
    });
    await writeEntitlementHistory(ctx, {
      createdAt: now,
      eventCreatedAt: event.created,
      eventId: event.id,
      eventType: event.type,
      ownerId,
      planKey: snapshot.planKey,
      reason: "Stripe invoice paid",
      state: "active",
    });

    return entitlementId;
  }

  await ctx.db.patch(existing._id, {
    currentPeriodEnd: snapshot.periodEnd,
    currentPeriodStart: snapshot.periodStart,
    graceEndsAt: undefined,
    lastPaymentAt: now,
    latestPaidInvoiceId: snapshot.invoiceId,
    latestPaymentEventCreatedAt: event.created,
    pendingPlanKey: undefined,
    pendingStripePriceId: undefined,
    planKey: snapshot.planKey,
    sourceEventCreatedAt: event.created,
    sourceEventId: event.id,
    state: "active",
    stripeCustomerId: snapshot.customerId,
    stripePriceId: snapshot.priceId,
    stripeSubscriptionId: snapshot.subscriptionId,
    updatedAt: now,
    version: existing.version + 1,
  });
  await writeEntitlementHistory(ctx, {
    createdAt: now,
    eventCreatedAt: event.created,
    eventId: event.id,
    eventType: event.type,
    ownerId,
    planKey: snapshot.planKey,
    previousPlanKey: existing.planKey,
    previousState: existing.state,
    reason: "Stripe invoice paid",
    state: "active",
  });

  return existing._id;
}
