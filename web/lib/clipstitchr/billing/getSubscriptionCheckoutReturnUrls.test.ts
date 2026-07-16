import { describe, expect, it } from "vitest";
import { getSubscriptionCheckoutReturnUrls } from "@/lib/clipstitchr/billing/getSubscriptionCheckoutReturnUrls";

describe("getSubscriptionCheckoutReturnUrls", () => {
  it("returns onboarding to the selected plan after payment or cancellation", () => {
    expect(
      getSubscriptionCheckoutReturnUrls({
        appUrl: "https://clipstitchr.com",
        checkoutIntentId: "6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9",
        planKey: "pro",
        returnTarget: "onboarding",
      }),
    ).toEqual({
      cancelUrl:
        "https://clipstitchr.com/dashboard/onboarding?plan=pro&billing=canceled&checkout_intent=6bc7d459-5b0a-4d9f-a62f-389fdf2b4af9",
      successUrl:
        "https://clipstitchr.com/dashboard/onboarding?plan=pro&billing=success",
    });
  });

  it("preserves the existing Settings return path", () => {
    expect(
      getSubscriptionCheckoutReturnUrls({
        appUrl: "https://clipstitchr.com",
        checkoutIntentId: "8f284d79-c798-4f39-9e73-3046198c2fab",
        planKey: "agency",
        returnTarget: "settings",
      }),
    ).toEqual({
      cancelUrl:
        "https://clipstitchr.com/dashboard/settings?billing=canceled&checkout_intent=8f284d79-c798-4f39-9e73-3046198c2fab",
      successUrl: "https://clipstitchr.com/dashboard/settings?billing=success",
    });
  });
});
