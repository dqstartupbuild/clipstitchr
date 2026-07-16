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
import { expireStripeSubscriptionCheckoutSession } from "./expireStripeSubscriptionCheckoutSession";
import { finishExpiringStripeSubscriptionCheckoutSession } from "./finishExpiringStripeSubscriptionCheckoutSession";

export const createSubscriptionCheckout = action({
  args: {
    planKey: planKeyValidator,
    replaceCheckoutIntentId: v.optional(v.string()),
    returnTarget: v.optional(subscriptionCheckoutReturnTargetValidator),
  },
  returns: v.object({ url: v.string() }),
  handler: async (
    ctx,
    { planKey, replaceCheckoutIntentId, returnTarget = "settings" },
  ) => {
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

      await assertStripeCustomerCanStartSubscriptionCheckout(
        stripe,
        customer.customerId,
      );

      if (claim.status === "completed") {
        await ctx.runMutation(
          internal.billing.retireCompletedSubscriptionCheckoutSessions
            .retireCompletedSubscriptionCheckoutSessions,
          {
            now: new Date().toISOString(),
            ownerId: identity.subject,
          },
        );
        continue;
      }

      if (claim.status === "expiring") {
        const expirationCompleted =
          await finishExpiringStripeSubscriptionCheckoutSession(ctx, stripe, {
            ownerId: identity.subject,
            stripeCheckoutSessionId: claim.stripeCheckoutSessionId,
          });

        if (!expirationCompleted) {
          throw new Error(
            "Another Checkout is closing now. Try again in a moment.",
          );
        }
        continue;
      }

      if (claim.status === "created" || claim.status === "handedOff") {
        const existingCheckout = await stripe.checkout.sessions.retrieve(
          claim.stripeCheckoutSessionId,
        );

        if (
          claimedPlanKey === planKey &&
          claim.returnTarget === returnTarget &&
          replaceCheckoutIntentId !== claim.checkoutIntentId &&
          existingCheckout.status === "open" &&
          existingCheckout.url
        ) {
          if (!claim.checkoutIntentId) {
            throw new Error("The Checkout claim needs billing support.");
          }

          const returnConfirmed = await ctx.runMutation(
            internal.billing.confirmSubscriptionCheckoutSessionReturn
              .confirmSubscriptionCheckoutSessionReturn,
            {
              catalogKey: claimedPlanKey,
              checkoutIntentId: claim.checkoutIntentId,
              now: new Date().toISOString(),
              ownerId: identity.subject,
              returnTarget: claim.returnTarget,
              stripeCheckoutSessionId: claim.stripeCheckoutSessionId,
            },
          );

          if (!returnConfirmed) {
            throw new Error(
              "That Checkout changed while it was opening. Try again.",
            );
          }

          return { url: existingCheckout.url };
        }

        if (existingCheckout.status === "complete") {
          throw new Error(
            "Your payment is still syncing. Refresh in a moment before starting another plan.",
          );
        }

        const replacesCanceledCheckout =
          replaceCheckoutIntentId === claim.checkoutIntentId;

        if (
          claim.status === "handedOff" &&
          existingCheckout.status === "open" &&
          !replacesCanceledCheckout
        ) {
          throw new Error(
            "Finish or cancel the Checkout already open before starting another plan.",
          );
        }

        const expirationCompleted =
          await expireStripeSubscriptionCheckoutSession(ctx, stripe, {
            allowHandedOff:
              existingCheckout.status === "expired" || replacesCanceledCheckout,
            checkoutStatus: existingCheckout.status,
            ownerId: identity.subject,
            stripeCheckoutSessionId: claim.stripeCheckoutSessionId,
          });

        if (!expirationCompleted) {
          throw new Error(
            "Another Checkout is already opening. Try again in a moment.",
          );
        }
        continue;
      }

      if (
        (claimedPlanKey !== planKey || claim.returnTarget !== returnTarget) &&
        Date.parse(now) - Date.parse(claim.createdAt) <
          subscriptionCheckoutClaimStaleMs
      ) {
        throw new Error(
          "Another Checkout is opening now. Try again in a moment.",
        );
      }

      if (!claim.checkoutIntentId) {
        throw new Error("The Checkout claim needs billing support.");
      }

      const claimedCatalogEntry = getStripeCatalogEntry(claimedPlanKey);
      await assertStripeCatalogEntry(stripe, claimedCatalogEntry);
      const returnUrls = getSubscriptionCheckoutReturnUrls({
        appUrl,
        checkoutIntentId: claim.checkoutIntentId,
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

      if (claimedPlanKey === planKey && claim.returnTarget === returnTarget) {
        if (!checkout.url) {
          throw new Error("Stripe did not return a hosted Checkout URL.");
        }

        const returnConfirmed = await ctx.runMutation(
          internal.billing.confirmSubscriptionCheckoutSessionReturn
            .confirmSubscriptionCheckoutSessionReturn,
          {
            catalogKey: claimedPlanKey,
            checkoutIntentId: claim.checkoutIntentId,
            now: new Date().toISOString(),
            ownerId: identity.subject,
            returnTarget: claim.returnTarget,
            stripeCheckoutSessionId: checkout.id,
          },
        );

        if (!returnConfirmed) {
          throw new Error(
            "That Checkout changed while it was opening. Try again.",
          );
        }

        return { url: checkout.url };
      }

      const expirationCompleted = await expireStripeSubscriptionCheckoutSession(
        ctx,
        stripe,
        {
          allowHandedOff: false,
          checkoutStatus: checkout.status,
          ownerId: identity.subject,
          stripeCheckoutSessionId: checkout.id,
        },
      );

      if (!expirationCompleted) {
        throw new Error(
          "Another Checkout is already opening. Try again in a moment.",
        );
      }
    }

    throw new Error(
      "Unable to start a new plan while an earlier Checkout is still open.",
    );
  },
});
