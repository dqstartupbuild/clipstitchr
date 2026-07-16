import { describe, expect, it } from "vitest";
import { getSubscriptionCheckoutReturnStatus } from "@/lib/clipstitchr/billing/getSubscriptionCheckoutReturnStatus";

describe("getSubscriptionCheckoutReturnStatus", () => {
  it("accepts only the two onboarding Checkout outcomes", () => {
    expect(getSubscriptionCheckoutReturnStatus("success")).toBe("success");
    expect(getSubscriptionCheckoutReturnStatus("canceled")).toBe("canceled");
    expect(getSubscriptionCheckoutReturnStatus("refill-success")).toBeUndefined();
    expect(
      getSubscriptionCheckoutReturnStatus(["success", "canceled"]),
    ).toBeUndefined();
  });
});
