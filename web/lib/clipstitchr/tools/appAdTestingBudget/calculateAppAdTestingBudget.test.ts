import { describe, expect, it } from "vitest";
import { calculateAppAdTestingBudget } from "@/lib/clipstitchr/tools/appAdTestingBudget/calculateAppAdTestingBudget";
import { defaultAppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/defaultAppAdTestingBudgetInput";

describe("calculateAppAdTestingBudget", () => {
  it("shows the visitor's allocation and evidence coverage", () => {
    const result = calculateAppAdTestingBudget(defaultAppAdTestingBudgetInput);

    expect(result.productionBudget).toBe(1_250);
    expect(result.reserveBudget).toBe(500);
    expect(result.mediaBudget).toBe(3_250);
    expect(result.mediaSpendPerActiveCell).toBeCloseTo(541.6667);
    expect(result.fundedActiveCellCount).toBe(6);
    expect(result.evidenceGap).toBe(0);
  });

  it("caps allocations at one hundred percent", () => {
    const result = calculateAppAdTestingBudget({
      ...defaultAppAdTestingBudgetInput,
      productionPercent: 80,
      reservePercent: 40,
    });

    expect(result.reservePercent).toBe(20);
    expect(result.mediaPercent).toBe(0);
    expect(result.mediaBudget).toBe(0);
  });
});
