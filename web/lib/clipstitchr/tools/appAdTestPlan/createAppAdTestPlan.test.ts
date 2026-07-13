import { describe, expect, it } from "vitest";
import { createAppAdTestPlan } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlan";
import { defaultAppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/defaultAppAdTestPlanInput";
import { formatAppAdTestPlanText } from "@/lib/clipstitchr/tools/appAdTestPlan/formatAppAdTestPlanText";

describe("createAppAdTestPlan", () => {
  it("reuses the variant opportunity and builds three sequential waves", () => {
    const result = createAppAdTestPlan(defaultAppAdTestPlanInput);

    expect(result.possibleCombinationCount).toBe(128);
    expect(result.practicalFirstBatchCount).toBe(8);
    expect(result.waves.map((wave) => wave.variantCount)).toEqual([8, 4, 3]);
    expect(result.totalPlannedVariantCount).toBe(15);
    expect(result.preparationItems).toEqual([]);
  });

  it("carries variants into later weeks without exceeding capacity", () => {
    const result = createAppAdTestPlan({
      ...defaultAppAdTestPlanInput,
      ugcOpeningCount: 10,
      hookCount: 5,
      weeklyProductionCapacity: 4,
    });

    expect(result.schedule.map((week) => week.variantCount)).toEqual([
      4, 4, 2, 4, 1, 3,
    ]);
    expect(
      result.schedule.every((week) => week.variantCount <= 4),
    ).toBe(true);
  });

  it("shows arithmetic budget allocation without inventing a benchmark", () => {
    const result = createAppAdTestPlan({
      ...defaultAppAdTestPlanInput,
      weeklyTestingBudget: 800,
    });

    expect(result.schedule[0]?.budgetPerLiveVariant).toBe(100);
    expect(result.schedule[1]?.budgetPerLiveVariant).toBe(200);
    expect(formatAppAdTestPlanText(result)).toContain("planning allocation");
  });

  it("returns preparation work instead of impossible variants", () => {
    const result = createAppAdTestPlan({
      ...defaultAppAdTestPlanInput,
      ugcOpeningCount: 1,
      demoCount: 0,
      hookCount: 1,
      callToActionCount: 0,
    });

    expect(result.waves.every((wave) => wave.status === "needs-assets")).toBe(
      true,
    );
    expect(result.waves.every((wave) => wave.variantCount === 0)).toBe(true);
    expect(result.schedule).toEqual([]);
    expect(result.preparationItems.join(" ")).toContain("Add 1 more UGC");
    expect(result.preparationItems.join(" ")).toContain("product demo");
  });

  it("normalizes unsafe counts and never formats undefined values", () => {
    const result = createAppAdTestPlan({
      ...defaultAppAdTestPlanInput,
      ugcOpeningCount: Number.NaN,
      demoCount: -3,
      weeklyProductionCapacity: 99,
      weeklyTestingBudget: Number.POSITIVE_INFINITY,
    });
    const text = formatAppAdTestPlanText(result);

    expect(result.possibleCombinationCount).toBe(0);
    expect(text).not.toContain("NaN");
    expect(text).not.toContain("Infinity");
    expect(text).not.toContain("undefined");
  });
});
