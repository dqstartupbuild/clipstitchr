import type { AppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostInput";
import { appUgcCostInputLimits } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostInputLimits";
import { normalizeAppUgcCostAmount } from "@/lib/clipstitchr/tools/appUgcCostCalculator/normalizeAppUgcCostAmount";
import { normalizeAppUgcCostCount } from "@/lib/clipstitchr/tools/appUgcCostCalculator/normalizeAppUgcCostCount";

export function normalizeAppUgcCostInput(
  input: AppUgcCostInput,
): AppUgcCostInput {
  return {
    creatorCount: normalizeAppUgcCostCount(
      input.creatorCount,
      appUgcCostInputLimits.count,
    ),
    feePerCreator: normalizeAppUgcCostAmount(
      input.feePerCreator,
      appUgcCostInputLimits.money,
    ),
    clipsPerCreator: normalizeAppUgcCostCount(
      input.clipsPerCreator,
      appUgcCostInputLimits.clipCount,
    ),
    editingHours: normalizeAppUgcCostAmount(
      input.editingHours,
      appUgcCostInputLimits.hours,
    ),
    editingHourlyRate: normalizeAppUgcCostAmount(
      input.editingHourlyRate,
      appUgcCostInputLimits.money,
    ),
    revisionCount: normalizeAppUgcCostCount(
      input.revisionCount,
      appUgcCostInputLimits.count,
    ),
    costPerRevision: normalizeAppUgcCostAmount(
      input.costPerRevision,
      appUgcCostInputLimits.money,
    ),
    internalHours: normalizeAppUgcCostAmount(
      input.internalHours,
      appUgcCostInputLimits.hours,
    ),
    internalHourlyCost: normalizeAppUgcCostAmount(
      input.internalHourlyCost,
      appUgcCostInputLimits.money,
    ),
    unusedFootagePercentage: normalizeAppUgcCostAmount(
      input.unusedFootagePercentage,
      appUgcCostInputLimits.percentage,
    ),
    finishedVariantCount: normalizeAppUgcCostCount(
      input.finishedVariantCount,
      appUgcCostInputLimits.clipCount,
    ),
    batchesPerMonth: normalizeAppUgcCostAmount(
      input.batchesPerMonth,
      appUgcCostInputLimits.batchesPerMonth,
    ),
  };
}
