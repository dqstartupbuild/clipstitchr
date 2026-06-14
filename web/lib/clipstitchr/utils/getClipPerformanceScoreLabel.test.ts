import { describe, expect, it } from "vitest";
import { getClipPerformanceScoreLabel } from "@/lib/clipstitchr/utils/getClipPerformanceScoreLabel";

describe("getClipPerformanceScoreLabel", () => {
  it("turns numeric clip scores into simple posting guidance", () => {
    expect(getClipPerformanceScoreLabel(90)).toBe("Worth using");
    expect(getClipPerformanceScoreLabel(70)).toBe("Good with a trim");
    expect(getClipPerformanceScoreLabel(55)).toBe("Needs a quick fix");
    expect(getClipPerformanceScoreLabel(30)).toBe("Skip for now");
  });
});
