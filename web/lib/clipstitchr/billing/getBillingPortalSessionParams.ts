import type Stripe from "stripe";
import type { BillingPortalFlow } from "./types/BillingPortalFlow";

export function getBillingPortalSessionParams({
  configurationId,
  customerId,
  flow,
  returnUrl,
  subscriptionId,
}: {
  configurationId: string;
  customerId: string;
  flow: BillingPortalFlow;
  returnUrl: string;
  subscriptionId?: string;
}): Stripe.BillingPortal.SessionCreateParams {
  if (flow === "subscription_update") {
    if (!subscriptionId) {
      throw new Error("An active subscription is required to change plans.");
    }

    return {
      configuration: configurationId,
      customer: customerId,
      return_url: returnUrl,
      flow_data: {
        after_completion: {
          redirect: { return_url: returnUrl },
          type: "redirect",
        },
        subscription_update: { subscription: subscriptionId },
        type: "subscription_update",
      },
    };
  }

  return {
    configuration: configurationId,
    customer: customerId,
    return_url: returnUrl,
  };
}
