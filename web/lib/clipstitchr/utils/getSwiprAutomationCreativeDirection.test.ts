import { describe, expect, it } from "vitest";
import { swiprAutomationCreativeDirections } from "@/lib/clipstitchr/constants/swiprAutomationCreativeDirections";
import { getSwiprAutomationCreativeDirection } from "@/lib/clipstitchr/utils/getSwiprAutomationCreativeDirection";

describe("getSwiprAutomationCreativeDirection", () => {
  it("returns a stable direction for each one-based draft index", () => {
    expect(getSwiprAutomationCreativeDirection(1)).toBe(
      swiprAutomationCreativeDirections[0],
    );
    expect(getSwiprAutomationCreativeDirection(2)).toBe(
      swiprAutomationCreativeDirections[1],
    );
  });

  it("wraps after all creative directions are used", () => {
    expect(
      getSwiprAutomationCreativeDirection(
        swiprAutomationCreativeDirections.length + 1,
      ),
    ).toBe(swiprAutomationCreativeDirections[0]);
  });

  it("falls back to the first direction for invalid indexes", () => {
    expect(getSwiprAutomationCreativeDirection(0)).toBe(
      swiprAutomationCreativeDirections[0],
    );
    expect(getSwiprAutomationCreativeDirection(Number.NaN)).toBe(
      swiprAutomationCreativeDirections[0],
    );
  });
});
