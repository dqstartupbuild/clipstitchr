import { describe, expect, it } from "vitest";
import { getBillingPortalSessionParams } from "@/lib/clipstitchr/billing/getBillingPortalSessionParams";

describe("getBillingPortalSessionParams", () => {
  const common = {
    configurationId: "bpc_live",
    customerId: "cus_live",
    returnUrl: "https://clipstitchr.com/dashboard/settings",
  };

  it("opens the dedicated Stripe subscription-update flow", () => {
    expect(
      getBillingPortalSessionParams({
        ...common,
        flow: "subscription_update",
        subscriptionId: "sub_live",
      }),
    ).toEqual({
      configuration: "bpc_live",
      customer: "cus_live",
      return_url: "https://clipstitchr.com/dashboard/settings",
      flow_data: {
        after_completion: {
          redirect: {
            return_url: "https://clipstitchr.com/dashboard/settings",
          },
          type: "redirect",
        },
        subscription_update: { subscription: "sub_live" },
        type: "subscription_update",
      },
    });
  });

  it("keeps the portal home available for invoices and payment methods", () => {
    expect(getBillingPortalSessionParams({ ...common, flow: "home" })).toEqual(
      {
        configuration: "bpc_live",
        customer: "cus_live",
        return_url: "https://clipstitchr.com/dashboard/settings",
      },
    );
  });

  it("rejects a plan-change flow without a subscription", () => {
    expect(() =>
      getBillingPortalSessionParams({
        ...common,
        flow: "subscription_update",
      }),
    ).toThrow("An active subscription is required");
  });
});
