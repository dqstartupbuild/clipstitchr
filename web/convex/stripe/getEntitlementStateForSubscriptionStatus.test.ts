import { describe, expect, it } from "vitest";
import { getEntitlementStateForSubscriptionStatus } from "./getEntitlementStateForSubscriptionStatus";

describe("getEntitlementStateForSubscriptionStatus", () => {
  it("requires a prior confirmed payment before granting grace", () => {
    expect(
      getEntitlementStateForSubscriptionStatus("past_due", false),
    ).toBe("inactive");
    expect(getEntitlementStateForSubscriptionStatus("past_due", true)).toBe(
      "grace",
    );
  });
});
