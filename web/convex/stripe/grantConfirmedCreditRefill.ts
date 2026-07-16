import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getStripeCatalogEntry } from "../../lib/clipstitchr/billing/getStripeCatalogEntry";
import { createUsagePeriodKey } from "../usage/createUsagePeriodKey";
import { grantCreditRefill } from "../usage/grantCreditRefill";
import { getStripeResourceId } from "./getStripeResourceId";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";

export async function grantConfirmedCreditRefill(
  ctx: MutationCtx,
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
) {
  if (paymentIntent.metadata.catalogKey !== "creation-credit-refill") {
    return null;
  }

  const catalogEntry = getStripeCatalogEntry("creation-credit-refill");

  if (
    paymentIntent.currency !== "usd" ||
    paymentIntent.amount_received !== catalogEntry.expectedUnitAmount
  ) {
    throw new Error("Confirmed refill payment does not match the catalog.");
  }

  const customerId = getStripeResourceId(paymentIntent.customer);
  const ownerId = await resolveStripeOwnerId(ctx, {
    customerId,
    metadataOwnerId: paymentIntent.metadata.ownerId,
  });
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();
  const now = new Date(event.created * 1_000).toISOString();

  if (
    !entitlement ||
    entitlement.billingReviewRequired ||
    getEffectiveEntitlementState(entitlement, now) !== "active" ||
    entitlement.stripeCustomerId !== customerId
  ) {
    throw new Error("Refill payment is not attached to an active subscription.");
  }

  return await grantCreditRefill(ctx, {
    eventId: event.id,
    now,
    ownerId,
    periodKey: createUsagePeriodKey(
      entitlement.stripeSubscriptionId,
      entitlement.currentPeriodStart,
    ),
    planKey: entitlement.planKey,
    stripeChargeId: getStripeResourceId(paymentIntent.latest_charge),
    stripePaymentIntentId: paymentIntent.id,
  });
}
