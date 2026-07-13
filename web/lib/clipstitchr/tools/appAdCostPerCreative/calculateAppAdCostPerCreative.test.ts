import { describe, expect, it } from "vitest";
import { calculateAppAdCostPerCreative } from "@/lib/clipstitchr/tools/appAdCostPerCreative/calculateAppAdCostPerCreative";
import { defaultAppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/defaultAppAdCostPerCreativeInput";

describe("calculateAppAdCostPerCreative", () => {
  it("compares the current unit cost with a reuse scenario", () => {
    const result = calculateAppAdCostPerCreative(
      defaultAppAdCostPerCreativeInput,
    );

    expect(result).toMatchObject({
      currentTotalCost: 2000,
      currentCostPerCreative: 250,
      appliedAdditionalCost: 400,
      incrementalCostPerCreative: 50,
      projectedCreativeCount: 16,
      projectedTotalCost: 2400,
      blendedCostPerCreative: 150,
      dollarChangePerCreative: 100,
      percentageChange: 40,
      referenceCostAtCurrentAverage: 4000,
      differenceVersusCurrentAverage: 1600,
    });
  });

  it("does not apply an extra cost without additional creatives", () => {
    const result = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      additionalCreativeCount: 0,
      additionalFinishingCost: 900,
    });

    expect(result.hasReuseScenario).toBe(false);
    expect(result.appliedAdditionalCost).toBe(0);
    expect(result.incrementalCostPerCreative).toBeNull();
    expect(result.projectedTotalCost).toBe(2000);
  });

  it("handles missing current and projected denominators", () => {
    const emptyResult = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      currentCreativeCount: 0,
      additionalCreativeCount: 0,
    });

    expect(emptyResult.currentCostPerCreative).toBeNull();
    expect(emptyResult.blendedCostPerCreative).toBeNull();
    expect(emptyResult.differenceVersusCurrentAverage).toBeNull();

    const addedOnlyResult = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      currentCreativeCount: 0,
      additionalCreativeCount: 4,
      additionalFinishingCost: 200,
    });

    expect(addedOnlyResult.currentCostPerCreative).toBeNull();
    expect(addedOnlyResult.blendedCostPerCreative).toBe(550);
  });

  it("preserves an honest increase and avoids an invalid percentage", () => {
    const result = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      sourceFootageCost: 0,
      editingCost: 0,
      internalCost: 0,
      otherCost: 0,
      currentCreativeCount: 2,
      additionalCreativeCount: 2,
      additionalFinishingCost: 400,
    });

    expect(result.currentCostPerCreative).toBe(0);
    expect(result.blendedCostPerCreative).toBe(100);
    expect(result.dollarChangePerCreative).toBe(-100);
    expect(result.percentageChange).toBeNull();
    expect(result.differenceVersusCurrentAverage).toBe(-400);
  });

  it("normalizes unsafe, negative, fractional, and oversized values", () => {
    const result = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      sourceFootageCost: Number.POSITIVE_INFINITY,
      editingCost: -20,
      currentCreativeCount: 3.9,
      additionalCreativeCount: 20_000,
      additionalFinishingCost: 2_000_000,
    });

    expect(result.currentCreativeCount).toBe(3);
    expect(result.additionalCreativeCount).toBe(10_000);
    expect(result.appliedAdditionalCost).toBe(1_000_000);
    expect(JSON.stringify(result)).not.toContain("NaN");
    expect(JSON.stringify(result)).not.toContain("Infinity");
  });
});
