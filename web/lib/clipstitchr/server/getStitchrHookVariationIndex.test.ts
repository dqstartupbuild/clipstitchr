import { describe, expect, it } from "vitest";
import { getStitchrHookVariationIndex } from "@/lib/clipstitchr/server/getStitchrHookVariationIndex";

describe("getStitchrHookVariationIndex", () => {
  it("maps Batch task suffixes to stable zero-based creative lanes", () => {
    expect(getStitchrHookVariationIndex("stitchr-batch:run:1")).toBe(0);
    expect(getStitchrHookVariationIndex("stitchr-batch:run:10")).toBe(9);
    expect(getStitchrHookVariationIndex("stitchr-batch:run:31")).toBe(0);
  });

  it("keeps non-Batch seeds deterministic", () => {
    const first = getStitchrHookVariationIndex("ugc_1:demo_1");

    expect(getStitchrHookVariationIndex("ugc_1:demo_1")).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(30);
  });
});
