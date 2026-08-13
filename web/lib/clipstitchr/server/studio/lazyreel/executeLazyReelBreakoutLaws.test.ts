import { describe, expect, it } from "vitest";
import { executeLazyReelBreakoutLaws } from "./executeLazyReelBreakoutLaws";

describe("executeLazyReelBreakoutLaws", () => {
  it("returns real laws, matched pairs, contrasts, and validation", () => {
    const result = executeLazyReelBreakoutLaws();

    expect(result.data.laws).toHaveLength(5);
    expect(result.data.laws[0].law).toContain("unresolved visual QUESTION");
    expect(result.data.conceptPairs[0]).toMatchObject({
      concept: "pets / question",
      gap: "11,228x",
    });
    expect(result.data.validation?.tests[1].accuracy).toContain("83.05%");
    expect(result.limitations.join(" ")).toContain("watch-time");
  });
});
