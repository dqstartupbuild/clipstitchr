import { describe, expect, it } from "vitest";
import { getSubscriptionCheckoutReturnUrls } from "@/lib/clipstitchr/billing/getSubscriptionCheckoutReturnUrls";

describe("getSubscriptionCheckoutReturnUrls", () => {
  it("returns onboarding to the selected plan after payment or cancellation", () => {
    expect(
      getSubscriptionCheckoutReturnUrls({
        appUrl: "https://clipstitchr.com",
        planKey: "pro",
        returnTarget: "onboarding",
      }),
    ).toEqual({
      cancelUrl:
        "https://clipstitchr.com/dashboard/onboarding?plan=pro&billing=canceled",
      successUrl:
        "https://clipstitchr.com/dashboard/onboarding?plan=pro&billing=success",
    });
  });

  it("preserves the existing Settings return path", () => {
    expect(
      getSubscriptionCheckoutReturnUrls({
        appUrl: "https://clipstitchr.com",
        planKey: "agency",
        returnTarget: "settings",
      }),
    ).toEqual({
      cancelUrl: "https://clipstitchr.com/dashboard/settings?billing=canceled",
      successUrl: "https://clipstitchr.com/dashboard/settings?billing=success",
    });
  });
});
