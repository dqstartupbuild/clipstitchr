import { describe, expect, it } from "vitest";
import { getHookLabVariationDirection } from "./getHookLabVariationDirection";

describe("getHookLabVariationDirection", () => {
  it("assigns all five versions distinct hook and visual directions", () => {
    const directions = Array.from({ length: 5 }, (_, index) =>
      getHookLabVariationDirection(index),
    );

    expect(new Set(directions.map((item) => item.hookTreatment)).size).toBe(5);
    expect(new Set(directions.map((item) => item.visualDirection)).size).toBe(5);
    expect(directions.map((item) => item.hookTreatment)).toEqual([
      expect.stringContaining("direct, specific observation"),
      expect.stringContaining("contrarian reframe"),
      expect.stringContaining("personal realization"),
      expect.stringContaining("concrete question"),
      expect.stringContaining("before-and-after tension"),
    ]);
  });
});
