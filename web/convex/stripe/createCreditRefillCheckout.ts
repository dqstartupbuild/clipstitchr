import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { assertStripeCatalogEntry } from "../../lib/clipstitchr/billing/assertStripeCatalogEntry";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { createCheckoutIntentId } from "../../lib/clipstitchr/billing/createCheckoutIntentId";
import { getBillingAppUrl } from "../../lib/clipstitchr/billing/getBillingAppUrl";
import { getCanonicalPaidStripeAccessIsActive } from "../../lib/clipstitchr/billing/getCanonicalPaidStripeAccessIsActive";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getStripeCatalogEntry } from "../../lib/clipstitchr/billing/getStripeCatalogEntry";
import { getStripeComponentClient } from "./getStripeComponentClient";

export const createCreditRefillCheckout = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = new Date().toISOString();
    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForOwner.getEntitlementForOwner,
      { ownerId: identity.subject },
    );

    if (
      !entitlement ||
      !getCanonicalPaidStripeAccessIsActive(entitlement, now) ||
      getEffectiveEntitlementState(entitlement, now) !== "active"
    ) {
      throw new Error(
        "Your subscription needs attention before you can buy refill credits.",
      );
    }

    await ctx.runMutation(
      internal.billing.consumeRefillCheckoutRateLimit
        .consumeRefillCheckoutRateLimit,
      { ownerId: identity.subject },
    );

    const catalogEntry = getStripeCatalogEntry("creation-credit-refill");
    await assertStripeCatalogEntry(createStripeSdk(), catalogEntry);

    const appUrl = getBillingAppUrl();
    const checkoutIntentId = createCheckoutIntentId();
    const checkout = await getStripeComponentClient().createCheckoutSession(
      ctx,
      {
        cancelUrl: `${appUrl}/dashboard/settings?billing=canceled`,
        customerId: entitlement.stripeCustomerId,
        metadata: {
          catalogKey: catalogEntry.catalogKey,
          operation: "creation_credit_refill",
          ownerId: identity.subject,
        },
        mode: "payment",
        params: { allow_promotion_codes: false },
        paymentIntentMetadata: {
          catalogKey: catalogEntry.catalogKey,
          checkoutIntentId,
          ownerId: identity.subject,
          stripeSubscriptionId: entitlement.stripeSubscriptionId,
        },
        priceId: catalogEntry.priceId,
        successUrl: `${appUrl}/dashboard/settings?billing=refill-success`,
      },
    );

    if (!checkout.url) {
      throw new Error("Stripe did not return a hosted Checkout URL.");
    }

    await ctx.runMutation(
      internal.billing.recordCheckoutSession.recordCheckoutSession,
      {
        catalogKey: catalogEntry.catalogKey,
        checkoutIntentId,
        mode: "payment",
        now,
        ownerId: identity.subject,
        stripeCheckoutSessionId: checkout.sessionId,
        stripePriceId: catalogEntry.priceId,
      },
    );

    return { url: checkout.url };
  },
});
