import { describe, expect, it } from "vitest";
import { getCanonicalPaidStripeAccessIsActive } from "@/lib/clipstitchr/billing/getCanonicalPaidStripeAccessIsActive";

describe("getCanonicalPaidStripeAccessIsActive", () => {
  const now = "2026-07-16T12:00:00.000Z";
  const paidPeriod = {
    billingReviewRequired: false,
    currentPeriodEnd: "2026-08-16T12:00:00.000Z",
    currentPeriodStart: "2026-07-16T10:00:00.000Z",
    state: "active" as const,
  };

  it("accepts canonical active access during its paid period", () => {
    expect(getCanonicalPaidStripeAccessIsActive(paidPeriod, now)).toBe(true);
  });

  it("does not let a temporary active support override qualify inactive access", () => {
    const overriddenEntitlement = {
      ...paidPeriod,
      state: "inactive" as const,
      supportOverrideExpiresAt: "2026-07-17T12:00:00.000Z",
      supportOverrideState: "active" as const,
    };

    expect(
      getCanonicalPaidStripeAccessIsActive(overriddenEntitlement, now),
    ).toBe(false);
  });

  it("rejects access outside the paid period or under billing review", () => {
    expect(
      getCanonicalPaidStripeAccessIsActive(
        { ...paidPeriod, currentPeriodEnd: now },
        now,
      ),
    ).toBe(false);
    expect(
      getCanonicalPaidStripeAccessIsActive(
        { ...paidPeriod, currentPeriodStart: "2026-07-16T12:00:00.001Z" },
        now,
      ),
    ).toBe(false);
    expect(
      getCanonicalPaidStripeAccessIsActive(
        { ...paidPeriod, billingReviewRequired: true },
        now,
      ),
    ).toBe(false);
  });

  it("fails closed for malformed period timestamps", () => {
    expect(
      getCanonicalPaidStripeAccessIsActive(
        { ...paidPeriod, currentPeriodEnd: "not-a-date" },
        now,
      ),
    ).toBe(false);
  });
});
