import { describe, expect, it } from "vitest";
import { calculateAdVariantPlan } from "@/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan";

describe("calculateAdVariantPlan", () => {
  it("calculates footage pairings, full combinations, and a practical batch", () => {
    const result = calculateAdVariantPlan({
      callToActionCount: 2,
      demoClipCount: 2,
      hookCount: 4,
      ugcClipCount: 8,
    });

    expect(result).toMatchObject({
      pairingCount: 16,
      possibleCombinationCount: 128,
      practicalFirstBatchCount: 8,
    });
    expect(result.testPhases).toHaveLength(3);
    expect(result.testPhases[0]?.description).toContain("8 UGC clips");
  });

  it("caps the practical Stitchr batch at 20 UGC clips and one demo", () => {
    const result = calculateAdVariantPlan({
      callToActionCount: 2,
      demoClipCount: 3,
      hookCount: 5,
      ugcClipCount: 27,
    });

    expect(result.pairingCount).toBe(81);
    expect(result.possibleCombinationCount).toBe(810);
    expect(result.practicalFirstBatchCount).toBe(20);
    expect(result.testPhases[0]?.description).toContain("20 UGC clips");
  });

  it("normalizes partial, negative, infinite, and oversized counts", () => {
    const result = calculateAdVariantPlan({
      callToActionCount: 4.9,
      demoClipCount: 2.8,
      hookCount: Number.POSITIVE_INFINITY,
      ugcClipCount: -3,
    });

    expect(result).toMatchObject({
      pairingCount: 0,
      possibleCombinationCount: 0,
      practicalFirstBatchCount: 0,
    });

    const cappedResult = calculateAdVariantPlan({
      callToActionCount: 5_000,
      demoClipCount: 1,
      hookCount: 1,
      ugcClipCount: 1,
    });

    expect(cappedResult.possibleCombinationCount).toBe(999);
  });

  it("does not promise a first batch without a product demo", () => {
    const result = calculateAdVariantPlan({
      callToActionCount: 1,
      demoClipCount: 0,
      hookCount: 1,
      ugcClipCount: 6,
    });

    expect(result.practicalFirstBatchCount).toBe(0);
    expect(result.testPhases[0]?.description).toContain(
      "at least one UGC clip and one product demo",
    );
    expect(result.testPhases[2]?.description).toContain(
      "Build the one-UGC-and-one-demo baseline first",
    );
    expect(result.testPhases[2]?.description).not.toContain("0 demos");
  });
});
