import { describe, expect, it } from "vitest";
import { calculateAppUgcCost } from "@/lib/clipstitchr/tools/appUgcCostCalculator/calculateAppUgcCost";
import { defaultAppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/defaultAppUgcCostInput";

describe("calculateAppUgcCost", () => {
  it("calculates production, per-item, unused, monthly, and annual costs", () => {
    const result = calculateAppUgcCost(defaultAppUgcCostInput);

    expect(result.creatorCost).toBe(1000);
    expect(result.rawClipCount).toBe(12);
    expect(result.editingCost).toBe(500);
    expect(result.revisionCost).toBe(300);
    expect(result.internalCost).toBe(240);
    expect(result.totalBatchCost).toBe(2040);
    expect(result.costPerRawClip).toBe(170);
    expect(result.costPerFinishedVariant).toBe(255);
    expect(result.estimatedUnusedFootageCost).toBe(330);
    expect(result.monthlyCost).toBe(4080);
    expect(result.annualCost).toBe(48960);
  });

  it("keeps unused-footage cost as a subset instead of adding it twice", () => {
    const result = calculateAppUgcCost({
      ...defaultAppUgcCostInput,
      editingHours: 0,
      revisionCount: 0,
      internalHours: 0,
      unusedFootagePercentage: 50,
    });

    expect(result.creatorCost).toBe(1000);
    expect(result.estimatedUnusedFootageCost).toBe(500);
    expect(result.totalBatchCost).toBe(1000);
  });

  it("returns missing denominator values instead of Infinity or NaN", () => {
    const result = calculateAppUgcCost({
      ...defaultAppUgcCostInput,
      creatorCount: 0,
      finishedVariantCount: 0,
      batchesPerMonth: 0,
    });

    expect(result.costPerRawClip).toBeNull();
    expect(result.costPerFinishedVariant).toBeNull();
    expect(result.monthlyCost).toBeNull();
    expect(result.annualCost).toBeNull();
    expect(JSON.stringify(result)).not.toContain("NaN");
    expect(JSON.stringify(result)).not.toContain("Infinity");
  });

  it("normalizes negative, fractional-count, percentage, and unsafe values", () => {
    const result = calculateAppUgcCost({
      ...defaultAppUgcCostInput,
      creatorCount: 2.9,
      feePerCreator: Number.POSITIVE_INFINITY,
      editingHours: -4,
      unusedFootagePercentage: 140,
    });

    expect(result.creatorCost).toBe(0);
    expect(result.rawClipCount).toBe(12);
    expect(result.editingCost).toBe(0);
    expect(result.unusedFootagePercentage).toBe(100);
  });
});
