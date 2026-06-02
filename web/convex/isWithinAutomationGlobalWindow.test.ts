import { describe, expect, it } from "vitest";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

describe("isWithinAutomationGlobalWindow", () => {
  it("allows the configured 09:00-13:00 UTC window", () => {
    expect(
      isWithinAutomationGlobalWindow("2026-05-31T09:00:00.000Z"),
    ).toBe(true);
    expect(
      isWithinAutomationGlobalWindow("2026-05-31T12:59:00.000Z"),
    ).toBe(true);
  });

  it("rejects times outside the global window", () => {
    expect(
      isWithinAutomationGlobalWindow("2026-05-31T08:59:00.000Z"),
    ).toBe(false);
    expect(
      isWithinAutomationGlobalWindow("2026-05-31T13:00:00.000Z"),
    ).toBe(false);
  });
});
