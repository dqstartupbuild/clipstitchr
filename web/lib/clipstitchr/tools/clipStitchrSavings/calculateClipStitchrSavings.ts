import type { ClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsInput";
import type { ClipStitchrSavingsResult } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsResult";
import { clipStitchrSavingsInputLimits } from "@/lib/clipstitchr/tools/clipStitchrSavings/clipStitchrSavingsInputLimits";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function calculateClipStitchrSavings(
  input: ClipStitchrSavingsInput,
): ClipStitchrSavingsResult {
  const currentMonthlyCreativeCount = normalizeBoundedCount(
    input.currentMonthlyCreativeCount,
    clipStitchrSavingsInputLimits.count,
  );
  const modeledMonthlyCreativeCount = normalizeBoundedCount(
    input.modeledMonthlyCreativeCount,
    clipStitchrSavingsInputLimits.count,
  );
  const currentEditingHoursPerCreative = normalizeBoundedDecimal(
    input.currentEditingHoursPerCreative,
    clipStitchrSavingsInputLimits.hours,
  );
  const modeledEditingHoursPerCreative = normalizeBoundedDecimal(
    input.modeledEditingHoursPerCreative,
    clipStitchrSavingsInputLimits.hours,
  );
  const currentMonthlyRevisionHours = normalizeBoundedDecimal(
    input.currentMonthlyRevisionHours,
    clipStitchrSavingsInputLimits.hours,
  );
  const modeledMonthlyRevisionHours = normalizeBoundedDecimal(
    input.modeledMonthlyRevisionHours,
    clipStitchrSavingsInputLimits.hours,
  );
  const hourlyTeamCost = normalizeBoundedDecimal(
    input.hourlyTeamCost,
    clipStitchrSavingsInputLimits.money,
  );
  const monthlySourceFootageCost = normalizeBoundedDecimal(
    input.monthlySourceFootageCost,
    clipStitchrSavingsInputLimits.money,
  );
  const currentMonthlySoftwareCost = normalizeBoundedDecimal(
    input.currentMonthlySoftwareCost,
    clipStitchrSavingsInputLimits.money,
  );
  const clipstitchrMonthlyPrice = normalizeBoundedDecimal(
    input.clipstitchrMonthlyPrice,
    clipStitchrSavingsInputLimits.money,
  );
  const usableSourceClipCount = normalizeBoundedCount(
    input.usableSourceClipCount,
    clipStitchrSavingsInputLimits.count,
  );
  const usedSourceClipCount = Math.min(
    normalizeBoundedCount(
      input.usedSourceClipCount,
      clipStitchrSavingsInputLimits.count,
    ),
    usableSourceClipCount,
  );
  const modeledUsedSourceClipCount = Math.min(
    normalizeBoundedCount(
      input.modeledUsedSourceClipCount,
      clipStitchrSavingsInputLimits.count,
    ),
    usableSourceClipCount,
  );
  const currentLaborHours =
    currentMonthlyCreativeCount * currentEditingHoursPerCreative +
    currentMonthlyRevisionHours;
  const modeledLaborHours =
    modeledMonthlyCreativeCount * modeledEditingHoursPerCreative +
    modeledMonthlyRevisionHours;
  const currentLaborCost = currentLaborHours * hourlyTeamCost;
  const modeledLaborCost = modeledLaborHours * hourlyTeamCost;
  const currentTotalCost =
    monthlySourceFootageCost + currentLaborCost + currentMonthlySoftwareCost;
  const modeledTotalCost =
    monthlySourceFootageCost + modeledLaborCost + clipstitchrMonthlyPrice;

  return {
    clipstitchrMonthlyPrice,
    clipstitchrPlanName: input.clipstitchrPlanName
      .trim()
      .slice(0, clipStitchrSavingsInputLimits.labelLength),
    costDifference: currentTotalCost - modeledTotalCost,
    currentCostPerCreative:
      currentMonthlyCreativeCount === 0
        ? null
        : currentTotalCost / currentMonthlyCreativeCount,
    currentFootageUtilizationPercent:
      usableSourceClipCount === 0
        ? null
        : (usedSourceClipCount / usableSourceClipCount) * 100,
    currentLaborCost,
    currentLaborHours,
    currentMonthlyCreativeCount,
    currentTotalCost,
    modeledCostPerCreative:
      modeledMonthlyCreativeCount === 0
        ? null
        : modeledTotalCost / modeledMonthlyCreativeCount,
    modeledFootageUtilizationPercent:
      usableSourceClipCount === 0
        ? null
        : (modeledUsedSourceClipCount / usableSourceClipCount) * 100,
    modeledLaborCost,
    modeledLaborHours,
    modeledMonthlyCreativeCount,
    modeledTotalCost,
    monthlySourceFootageCost,
    timeDifferenceHours: currentLaborHours - modeledLaborHours,
    usableSourceClipCount,
  };
}
