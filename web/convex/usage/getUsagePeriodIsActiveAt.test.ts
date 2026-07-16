import { describe, expect, it } from "vitest";
import { getUsagePeriodIsActiveAt } from "./getUsagePeriodIsActiveAt";

describe("getUsagePeriodIsActiveAt", () => {
  const period = {
    periodEnd: "2026-08-01T00:00:00.000Z",
    periodStart: "2026-07-01T00:00:00.000Z",
  };

  it("accepts the inclusive period start and rejects the exclusive end", () => {
    expect(getUsagePeriodIsActiveAt(period, period.periodStart)).toBe(true);
    expect(getUsagePeriodIsActiveAt(period, period.periodEnd)).toBe(false);
  });

  it("rejects not-yet-active, expired, and malformed periods", () => {
    expect(getUsagePeriodIsActiveAt(period, "2026-06-30T23:59:59.999Z")).toBe(
      false,
    );
    expect(getUsagePeriodIsActiveAt(period, "2026-08-01T00:00:00.001Z")).toBe(
      false,
    );
    expect(
      getUsagePeriodIsActiveAt(
        { ...period, periodEnd: "not-a-date" },
        "2026-07-16T12:00:00.000Z",
      ),
    ).toBe(false);
  });
});
