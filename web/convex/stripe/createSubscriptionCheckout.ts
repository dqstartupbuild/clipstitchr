import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { assertStripeCatalogEntry } from "../../lib/clipstitchr/billing/assertStripeCatalogEntry";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { getBillingAppUrl } from "../../lib/clipstitchr/billing/getBillingAppUrl";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getStripeCatalogEntry } from "../../lib/clipstitchr/billing/getStripeCatalogEntry";
import { isPlanKey } from "../../lib/clipstitchr/billing/isPlanKey";
import { getSubscriptionCheckoutReturnUrls } from "../../lib/clipstitchr/billing/getSubscriptionCheckoutReturnUrls";
import { subscriptionCheckoutClaimStaleMs } from "../../lib/clipstitchr/billing/subscriptionCheckoutClaimStaleMs";
import { planKeyValidator } from "../validators/planKey";
import { subscriptionCheckoutReturnTargetValidator } from "../validators/subscriptionCheckoutReturnTarget";
import { getStripeComponentClient } from "./getStripeComponentClient";
import { assertStripeCustomerCanStartSubscriptionCheckout } from "./assertStripeCustomerCanStartSubscriptionCheckout";
import { createStripeSubscriptionCheckoutSession } from "./createStripeSubscriptionCheckoutSession";

export const createSubscriptionCheckout = action({
  args: {
    planKey: planKeyValidator,
    returnTarget: v.optional(subscriptionCheckoutReturnTargetValidator),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, { planKey, returnTarget = "settings" }) => {
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
    const stripe = createStripeSdk();
    await assertStripeCatalogEntry(stripe, catalogEntry);

    const stripeClient = getStripeComponentClient();
    const customer = entitlement
      ? { customerId: entitlement.stripeCustomerId }
      : await stripeClient.getOrCreateCustomer(ctx, {
          email: identity.email,
          name: identity.name,
          userId: identity.subject,
        });
    await assertStripeCustomerCanStartSubscriptionCheckout(
      stripe,
      customer.customerId,
    );
    const appUrl = getBillingAppUrl();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const claim = await ctx.runMutation(
        internal.billing.claimSubscriptionCheckoutSession
          .claimSubscriptionCheckoutSession,
        {
          now,
          ownerId: identity.subject,
          planKey,
          returnTarget,
        },
      );
      const claimedPlanKey = isPlanKey(claim.catalogKey)
        ? claim.catalogKey
        : undefined;

      if (!claimedPlanKey) {
        throw new Error("The existing Checkout plan needs billing support.");
      }

      if (claim.status === "created") {
        const existingCheckout = await stripe.checkout.sessions.retrieve(
          claim.stripeCheckoutSessionId,
        );

        if (
          claimedPlanKey === planKey &&
          existingCheckout.status === "open" &&
          existingCheckout.url
        ) {
          return { url: existingCheckout.url };
        }

        if (existingCheckout.status === "complete") {
          throw new Error(
            "Your payment is still syncing. Refresh in a moment before starting another plan.",
          );
        }

        if (existingCheckout.status === "open") {
          await stripe.checkout.sessions.expire(existingCheckout.id);
        }

        await ctx.runMutation(
          internal.billing.expireSubscriptionCheckoutSession
            .expireSubscriptionCheckoutSession,
          {
            now: new Date().toISOString(),
            ownerId: identity.subject,
            stripeCheckoutSessionId: claim.stripeCheckoutSessionId,
          },
        );
        continue;
      }

      if (
        claimedPlanKey !== planKey &&
        Date.parse(now) - Date.parse(claim.createdAt) <
          subscriptionCheckoutClaimStaleMs
      ) {
        throw new Error(
          "Another plan Checkout is opening now. Try again in a moment.",
        );
      }

      if (!claim.checkoutIntentId) {
        throw new Error("The Checkout claim needs billing support.");
      }

      const claimedCatalogEntry = getStripeCatalogEntry(claimedPlanKey);
      await assertStripeCatalogEntry(stripe, claimedCatalogEntry);
      const returnUrls = getSubscriptionCheckoutReturnUrls({
        appUrl,
        planKey: claimedPlanKey,
        returnTarget: claim.returnTarget,
      });
      const checkout = await createStripeSubscriptionCheckoutSession(stripe, {
        cancelUrl: returnUrls.cancelUrl,
        checkoutIntentId: claim.checkoutIntentId,
        customerId: customer.customerId,
        ownerId: identity.subject,
        planKey: claimedPlanKey,
        priceId: claimedCatalogEntry.priceId,
        successUrl: returnUrls.successUrl,
      });

      await ctx.runMutation(
        internal.billing.recordCheckoutSession.recordCheckoutSession,
        {
          catalogKey: claimedPlanKey,
          checkoutIntentId: claim.checkoutIntentId,
          mode: "subscription",
          now: new Date().toISOString(),
          ownerId: identity.subject,
          returnTarget: claim.returnTarget,
          stripeCheckoutSessionId: checkout.id,
          stripePriceId: claimedCatalogEntry.priceId,
        },
      );

      if (claimedPlanKey === planKey) {
        if (!checkout.url) {
          throw new Error("Stripe did not return a hosted Checkout URL.");
        }

        return { url: checkout.url };
      }

      if (checkout.status === "open") {
        await stripe.checkout.sessions.expire(checkout.id);
      }
      await ctx.runMutation(
        internal.billing.expireSubscriptionCheckoutSession
          .expireSubscriptionCheckoutSession,
        {
          now: new Date().toISOString(),
          ownerId: identity.subject,
          stripeCheckoutSessionId: checkout.id,
        },
      );
    }

    throw new Error(
      "Unable to start a new plan while an earlier Checkout is still open.",
    );
  },
});
