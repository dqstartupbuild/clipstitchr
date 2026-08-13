import { describe, expect, it } from "vitest";
import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";

describe("matchesLazyReelTextFilter", () => {
  it("supports normalized exact and fuzzy containment", () => {
    expect(matchesLazyReelTextFilter("tech and SaaS", "SAAS")).toBe(true);
    expect(matchesLazyReelTextFilter("before-after", "before after")).toBe(true);
  });

  it("never lets an empty filter or value match", () => {
    expect(matchesLazyReelTextFilter("skincare", "  ")).toBe(false);
    expect(matchesLazyReelTextFilter("", "skincare")).toBe(false);
    expect(matchesLazyReelTextFilter(null, "skincare")).toBe(false);
  });
});
