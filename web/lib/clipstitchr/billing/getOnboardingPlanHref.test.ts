import { describe, expect, it } from "vitest";
import { getOnboardingPlanHref } from "@/lib/clipstitchr/billing/getOnboardingPlanHref";

describe("getOnboardingPlanHref", () => {
  it("preserves a selected plan and supports planless signup", () => {
    expect(getOnboardingPlanHref("pro")).toBe(
      "/dashboard/onboarding?plan=pro",
    );
    expect(getOnboardingPlanHref()).toBe("/dashboard/onboarding");
  });
});
