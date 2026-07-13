import type { AppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostInput";
import type { AppUgcCostResult } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostResult";
import { normalizeAppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/normalizeAppUgcCostInput";

export function calculateAppUgcCost(
  input: AppUgcCostInput,
): AppUgcCostResult {
  const normalizedInput = normalizeAppUgcCostInput(input);
  const creatorCost =
    normalizedInput.creatorCount * normalizedInput.feePerCreator;
  const rawClipCount =
    normalizedInput.creatorCount * normalizedInput.clipsPerCreator;
  const editingCost =
    normalizedInput.editingHours * normalizedInput.editingHourlyRate;
  const revisionCost =
    normalizedInput.revisionCount * normalizedInput.costPerRevision;
  const internalCost =
    normalizedInput.internalHours * normalizedInput.internalHourlyCost;
  const totalBatchCost =
    creatorCost + editingCost + revisionCost + internalCost;
  const monthlyCost =
    normalizedInput.batchesPerMonth > 0
      ? totalBatchCost * normalizedInput.batchesPerMonth
      : null;

  return {
    creatorCost,
    rawClipCount,
    editingCost,
    revisionCost,
    internalCost,
    totalBatchCost,
    costPerRawClip:
      rawClipCount > 0 ? totalBatchCost / rawClipCount : null,
    finishedVariantCount: normalizedInput.finishedVariantCount,
    costPerFinishedVariant:
      normalizedInput.finishedVariantCount > 0
        ? totalBatchCost / normalizedInput.finishedVariantCount
        : null,
    unusedFootagePercentage: normalizedInput.unusedFootagePercentage,
    estimatedUnusedFootageCost:
      creatorCost * (normalizedInput.unusedFootagePercentage / 100),
    monthlyCost,
    annualCost: monthlyCost === null ? null : monthlyCost * 12,
  };
}
