import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { assertStripeCatalogEntry } from "../../lib/clipstitchr/billing/assertStripeCatalogEntry";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { getBillingAppUrl } from "../../lib/clipstitchr/billing/getBillingAppUrl";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getStripeCatalogEntry } from "../../lib/clipstitchr/billing/getStripeCatalogEntry";
import { planKeyValidator } from "../validators/planKey";
import { getStripeComponentClient } from "./getStripeComponentClient";

export const createSubscriptionCheckout = action({
  args: { planKey: planKeyValidator },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, { planKey }) => {
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
      entitlement &&
      getEffectiveEntitlementState(entitlement, now) !== "inactive"
    ) {
      throw new Error("Manage your current plan in the billing portal.");
    }

    await ctx.runMutation(
      internal.billing.consumeSubscriptionCheckoutRateLimit
        .consumeSubscriptionCheckoutRateLimit,
      { ownerId: identity.subject },
    );

    const catalogEntry = getStripeCatalogEntry(planKey);
    await assertStripeCatalogEntry(createStripeSdk(), catalogEntry);

    const stripeClient = getStripeComponentClient();
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      email: identity.email,
      name: identity.name,
      userId: identity.subject,
    });
    const appUrl = getBillingAppUrl();
    const checkout = await stripeClient.createCheckoutSession(ctx, {
      cancelUrl: `${appUrl}/dashboard/settings?billing=canceled`,
      customerId: customer.customerId,
      metadata: {
        catalogKey: planKey,
        operation: "subscription_checkout",
        ownerId: identity.subject,
      },
      mode: "subscription",
      params: {
        allow_promotion_codes: false,
        billing_address_collection: "auto",
        client_reference_id: identity.subject,
      },
      priceId: catalogEntry.priceId,
      subscriptionMetadata: {
        catalogKey: planKey,
        ownerId: identity.subject,
        planKey,
      },
      successUrl: `${appUrl}/dashboard/settings?billing=success`,
    });

    if (!checkout.url) {
      throw new Error("Stripe did not return a hosted Checkout URL.");
    }

    await ctx.runMutation(
      internal.billing.recordCheckoutSession.recordCheckoutSession,
      {
        catalogKey: planKey,
        mode: "subscription",
        now,
        ownerId: identity.subject,
        stripeCheckoutSessionId: checkout.sessionId,
      },
    );

    return { url: checkout.url };
  },
});
