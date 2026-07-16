import { describe, expect, it } from "vitest";
import { getBillingPlanActionLabel } from "@/app/_components/settings/getBillingPlanActionLabel";

describe("getBillingPlanActionLabel", () => {
  it("makes upgrades, downgrades, and the current plan explicit", () => {
    expect(
      getBillingPlanActionLabel({ currentPlanKey: "starter", planKey: "pro" }),
    ).toBe("Upgrade to Pro in Stripe");
    expect(
      getBillingPlanActionLabel({
        currentPlanKey: "agency",
        planKey: "starter",
      }),
    ).toBe("Change to Starter in Stripe");
    expect(
      getBillingPlanActionLabel({ currentPlanKey: "pro", planKey: "pro" }),
    ).toBe("Current plan");
    expect(getBillingPlanActionLabel({ planKey: "agency" })).toBe(
      "Choose Agency",
    );
  });
});
