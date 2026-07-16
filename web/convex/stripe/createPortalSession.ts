import { v } from "convex/values";
import { action } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { getBillingAppUrl } from "../../lib/clipstitchr/billing/getBillingAppUrl";
import { getBillingPortalSessionParams } from "../../lib/clipstitchr/billing/getBillingPortalSessionParams";
import { getStripePortalConfigurationId } from "../../lib/clipstitchr/billing/getStripePortalConfigurationId";
import { billingPortalFlowValidator } from "../validators/billingPortalFlow";

export const createPortalSession = action({
  args: { flow: v.optional(billingPortalFlowValidator) },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, { flow = "home" }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.runMutation(
      internal.billing.consumePortalSessionRateLimit
        .consumePortalSessionRateLimit,
      { ownerId: identity.subject },
    );

    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForOwner.getEntitlementForOwner,
      { ownerId: identity.subject },
    );
    const componentCustomer = entitlement
      ? null
      : await ctx.runQuery(components.stripe.public.getCustomerByUserId, {
          userId: identity.subject,
        });
    const customerId =
      entitlement?.stripeCustomerId ?? componentCustomer?.stripeCustomerId;

    if (!customerId) {
      throw new Error("Start a plan before opening billing settings.");
    }

    const returnUrl = `${getBillingAppUrl()}/dashboard/settings`;
    const session = await createStripeSdk().billingPortal.sessions.create(
      getBillingPortalSessionParams({
        configurationId: getStripePortalConfigurationId(),
        customerId,
        flow,
        returnUrl,
        subscriptionId: entitlement?.stripeSubscriptionId,
      }),
    );

    return { url: session.url };
  },
});
