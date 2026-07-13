import { describe, expect, it } from "vitest";
import { calculateClipStitchrSavings } from "@/lib/clipstitchr/tools/clipStitchrSavings/calculateClipStitchrSavings";
import { defaultClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/defaultClipStitchrSavingsInput";

describe("calculateClipStitchrSavings", () => {
  it("compares two transparent monthly workflow scenarios", () => {
    const result = calculateClipStitchrSavings(defaultClipStitchrSavingsInput);

    expect(result.clipstitchrMonthlyPrice).toBe(39);
    expect(result.currentLaborHours).toBe(44);
    expect(result.modeledLaborHours).toBe(22);
    expect(result.currentTotalCost).toBe(3_440);
    expect(result.modeledTotalCost).toBe(2_339);
    expect(result.costDifference).toBe(1_101);
    expect(result.currentFootageUtilizationPercent).toBe(40);
    expect(result.modeledFootageUtilizationPercent).toBe(80);
  });

  it("caps used footage at the entered usable inventory", () => {
    const result = calculateClipStitchrSavings({
      ...defaultClipStitchrSavingsInput,
      usableSourceClipCount: 5,
      usedSourceClipCount: 20,
      modeledUsedSourceClipCount: 30,
    });

    expect(result.currentFootageUtilizationPercent).toBe(100);
    expect(result.modeledFootageUtilizationPercent).toBe(100);
  });
});
