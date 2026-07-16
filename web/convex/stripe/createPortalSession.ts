import { v } from "convex/values";
import { action } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { getBillingAppUrl } from "../../lib/clipstitchr/billing/getBillingAppUrl";
import { getStripePortalConfigurationId } from "../../lib/clipstitchr/billing/getStripePortalConfigurationId";

export const createPortalSession = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx) => {
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

    const session = await createStripeSdk().billingPortal.sessions.create({
      configuration: getStripePortalConfigurationId(),
      customer: customerId,
      return_url: `${getBillingAppUrl()}/dashboard/settings`,
    });

    return { url: session.url };
  },
});
