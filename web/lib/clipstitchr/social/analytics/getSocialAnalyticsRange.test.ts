import { describe, expect, it } from "vitest";
import { getSocialAnalyticsRange } from "./getSocialAnalyticsRange";

describe("getSocialAnalyticsRange", () => {
  it.each([
    ["24_hours", "2026-07-31T12:00:00.000Z"],
    ["7_days", "2026-07-25T12:00:00.000Z"],
    ["30_days", "2026-07-02T12:00:00.000Z"],
  ] as const)("resolves the %s preset", (preset, rangeStart) => {
    expect(
      getSocialAnalyticsRange({
        preset,
        customStart: "",
        customEnd: "",
        now: "2026-08-01T12:00:00.000Z",
      }),
    ).toEqual({
      rangeStart,
      rangeEnd: "2026-08-01T12:00:00.000Z",
      isValid: true,
    });
  });

  it("preserves a valid custom range and rejects an inverted one", () => {
    expect(
      getSocialAnalyticsRange({
        preset: "custom",
        customStart: "2026-07-10T00:00:00.000Z",
        customEnd: "2026-07-20T00:00:00.000Z",
        now: "2026-08-01T12:00:00.000Z",
      }),
    ).toMatchObject({
      rangeStart: "2026-07-10T00:00:00.000Z",
      rangeEnd: "2026-07-20T00:00:00.000Z",
      isValid: true,
    });
    expect(
      getSocialAnalyticsRange({
        preset: "custom",
        customStart: "2026-07-20T00:00:00.000Z",
        customEnd: "2026-07-10T00:00:00.000Z",
        now: "2026-08-01T12:00:00.000Z",
      }).isValid,
    ).toBe(false);
  });
});
