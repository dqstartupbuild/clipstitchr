import { describe, expect, it } from "vitest";
import { getPlanChangeCreditAdjustment } from "./getPlanChangeCreditAdjustment";

describe("getPlanChangeCreditAdjustment", () => {
  it("grants only the remaining prorated positive difference", () => {
    expect(
      getPlanChangeCreditAdjustment({
        currentCredits: 2_000,
        nextCredits: 8_000,
        now: "2026-07-16T00:00:00.000Z",
        periodStart: "2026-07-01T00:00:00.000Z",
        periodEnd: "2026-07-31T00:00:00.000Z",
      }),
    ).toBe(3_000);
  });

  it("never grants credits for a downgrade", () => {
    expect(
      getPlanChangeCreditAdjustment({
        currentCredits: 8_000,
        nextCredits: 2_000,
        now: "2026-07-16T00:00:00.000Z",
        periodStart: "2026-07-01T00:00:00.000Z",
        periodEnd: "2026-07-31T00:00:00.000Z",
      }),
    ).toBe(0);
  });
});
