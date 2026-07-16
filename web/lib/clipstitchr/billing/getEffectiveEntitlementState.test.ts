import { describe, expect, it } from "vitest";
import { getEffectiveEntitlementState } from "@/lib/clipstitchr/billing/getEffectiveEntitlementState";

describe("getEffectiveEntitlementState", () => {
  const now = "2026-07-16T12:00:00.000Z";

  it("ends payment grace after exactly 72 hours", () => {
    expect(
      getEffectiveEntitlementState(
        {
          graceEndsAt: "2026-07-16T12:00:00.000Z",
          state: "grace",
        },
        now,
      ),
    ).toBe("inactive");
    expect(
      getEffectiveEntitlementState(
        {
          graceEndsAt: "2026-07-16T12:00:00.001Z",
          state: "grace",
        },
        now,
      ),
    ).toBe("grace");
  });

  it("ends period-end cancellation when the paid period finishes", () => {
    expect(
      getEffectiveEntitlementState(
        {
          cancelAtPeriodEnd: true,
          currentPeriodEnd: now,
          state: "active",
        },
        now,
      ),
    ).toBe("inactive");
  });

  it("honors a current temporary support override first", () => {
    expect(
      getEffectiveEntitlementState(
        {
          graceEndsAt: "2026-07-15T12:00:00.000Z",
          state: "grace",
          supportOverrideExpiresAt: "2026-07-17T12:00:00.000Z",
          supportOverrideState: "active",
        },
        now,
      ),
    ).toBe("active");
  });
});
