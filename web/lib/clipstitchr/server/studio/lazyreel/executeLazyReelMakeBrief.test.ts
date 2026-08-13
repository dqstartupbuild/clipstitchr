import { describe, expect, it } from "vitest";
import { executeLazyReelMakeBrief } from "./executeLazyReelMakeBrief";

describe("executeLazyReelMakeBrief", () => {
  it.each(["brief", "ideas", "hooks"] as const)("supports deterministic %s mode", (mode) => {
    const request = {
      audience: "busy runners",
      count: 5,
      mode,
      niche: "fitness",
      product: "Trail Electrolyte Mix",
      tool: "make_brief" as const,
    };

    const first = executeLazyReelMakeBrief(request);
    const second = executeLazyReelMakeBrief(request);

    expect(first).toEqual(second);
    expect(first.data.mode).toBe(mode);
    expect(first.data.breakoutChecklist).toHaveLength(5);
    if (mode === "brief") {
      expect(first.data.beats.length).toBeGreaterThanOrEqual(3);
      expect(first.data.hooks).toHaveLength(5);
    }
    if (mode === "ideas") {
      expect(first.data.concepts).toHaveLength(5);
    }
    if (mode === "hooks") {
      expect(first.data.hooks).toHaveLength(5);
    }
  });

  it("rejects an empty product", () => {
    expect(() =>
      executeLazyReelMakeBrief({ product: "  ", tool: "make_brief" }),
    ).toThrow("Product is required");
  });
});
