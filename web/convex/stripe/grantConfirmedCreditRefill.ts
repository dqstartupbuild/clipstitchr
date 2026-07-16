import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getCanonicalPaidStripeAccessIsActive } from "../../lib/clipstitchr/billing/getCanonicalPaidStripeAccessIsActive";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getStripeCatalogEntry } from "../../lib/clipstitchr/billing/getStripeCatalogEntry";
import { createUsagePeriodKey } from "../usage/createUsagePeriodKey";
import { grantCreditRefill } from "../usage/grantCreditRefill";
import { getStripeResourceId } from "./getStripeResourceId";
import { getStripePaymentHasOpenHold } from "./getStripePaymentHasOpenHold";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";

export async function grantConfirmedCreditRefill(
  ctx: MutationCtx,
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
  options?: { allowBillingReviewForRecovery?: boolean },
) {
  if (paymentIntent.metadata.catalogKey !== "creation-credit-refill") {
    return null;
  }

  const catalogEntry = getStripeCatalogEntry("creation-credit-refill");
  const checkoutIntentId = paymentIntent.metadata.checkoutIntentId?.trim();
  const purchaseStripeSubscriptionId =
    paymentIntent.metadata.stripeSubscriptionId?.trim();

  if (!checkoutIntentId || !purchaseStripeSubscriptionId) {
    throw new Error("Confirmed refill payment is missing its Checkout origin.");
  }

  const checkout = await ctx.db
    .query("billingCheckoutSessions")
    .withIndex("by_checkout_intent", (query) =>
      query.eq("checkoutIntentId", checkoutIntentId),
    )
    .unique();
  const paymentHasOpenHold = await getStripePaymentHasOpenHold(ctx, {
    paymentIntentId: paymentIntent.id,
  });

  if (
    !checkout ||
    checkout.catalogKey !== catalogEntry.catalogKey ||
    checkout.mode !== "payment" ||
    checkout.ownerId !== paymentIntent.metadata.ownerId ||
    checkout.stripePriceId !== catalogEntry.priceId ||
    paymentIntent.currency !== "usd" ||
    paymentIntent.amount_received !== catalogEntry.expectedUnitAmount
  ) {
    throw new Error("Confirmed refill payment does not match the catalog.");
  }

  if (paymentHasOpenHold) {
    return null;
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

  if (!entitlement) {
    throw new Error(
      "Refill payment is not attached to an active subscription.",
    );
  }

  const entitlementForAccess = options?.allowBillingReviewForRecovery
    ? { ...entitlement, billingReviewRequired: false }
    : entitlement;

  if (
    !getCanonicalPaidStripeAccessIsActive(entitlementForAccess, now) ||
    getEffectiveEntitlementState(entitlement, now) !== "active" ||
    entitlement.stripeCustomerId !== customerId
  ) {
    throw new Error(
      "Refill payment is not attached to an active subscription.",
    );
  }

  if (
    !options?.allowBillingReviewForRecovery &&
    entitlement.stripeSubscriptionId !== purchaseStripeSubscriptionId
  ) {
    throw new Error(
      "Refill payment belongs to a different Stripe subscription.",
    );
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
    stripeSubscriptionId: purchaseStripeSubscriptionId,
  });
}
