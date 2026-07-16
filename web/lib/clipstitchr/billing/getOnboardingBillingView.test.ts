import { describe, expect, it } from "vitest";
import { getOnboardingBillingView } from "@/lib/clipstitchr/billing/getOnboardingBillingView";

describe("getOnboardingBillingView", () => {
  it("unlocks onboarding only from a usable projected entitlement", () => {
    expect(
      getOnboardingBillingView({
        billingReviewRequired: false,
        entitlementState: "active",
        isLoading: false,
      }),
    ).toBe("onboarding");
    expect(
      getOnboardingBillingView({
        billingReviewRequired: false,
        entitlementState: "grace",
        isLoading: false,
      }),
    ).toBe("onboarding");
  });

  it("waits for the signed webhook after a success redirect", () => {
    expect(
      getOnboardingBillingView({
        billingReviewRequired: false,
        billingReturn: "success",
        entitlementState: "inactive",
        isLoading: false,
        selectedPlanKey: "pro",
      }),
    ).toBe("confirming");
  });

  it("keeps unpaid and review states out of product setup", () => {
    expect(
      getOnboardingBillingView({
        billingReviewRequired: false,
        isLoading: false,
        selectedPlanKey: "starter",
      }),
    ).toBe("checkout");
    expect(
      getOnboardingBillingView({
        billingReviewRequired: false,
        isLoading: false,
      }),
    ).toBe("select-plan");
    expect(
      getOnboardingBillingView({
        billingReviewRequired: true,
        entitlementState: "active",
        isLoading: false,
      }),
    ).toBe("review");
  });
});
