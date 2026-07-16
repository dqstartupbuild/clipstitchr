import { describe, expect, it } from "vitest";
import { getBillingEntitlementStateLabel } from "@/app/_components/settings/getBillingEntitlementStateLabel";

describe("getBillingEntitlementStateLabel", () => {
  it("translates internal entitlement states into customer language", () => {
    expect(getBillingEntitlementStateLabel("active")).toBe("Active");
    expect(getBillingEntitlementStateLabel("grace")).toBe(
      "Payment needs attention",
    );
    expect(getBillingEntitlementStateLabel("inactive")).toBe("Ended");
  });
});
