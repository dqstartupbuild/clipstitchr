import type { AppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeInput";
import type { AppAdCostPerCreativeResult } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeResult";
import { normalizeAppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/normalizeAppAdCostPerCreativeInput";

export function calculateAppAdCostPerCreative(
  input: AppAdCostPerCreativeInput,
): AppAdCostPerCreativeResult {
  const normalizedInput = normalizeAppAdCostPerCreativeInput(input);
  const currentTotalCost =
    normalizedInput.sourceFootageCost +
    normalizedInput.editingCost +
    normalizedInput.internalCost +
    normalizedInput.otherCost;
  const currentCostPerCreative =
    normalizedInput.currentCreativeCount > 0
      ? currentTotalCost / normalizedInput.currentCreativeCount
      : null;
  const hasReuseScenario = normalizedInput.additionalCreativeCount > 0;
  const appliedAdditionalCost = hasReuseScenario
    ? normalizedInput.additionalFinishingCost
    : 0;
  const projectedCreativeCount =
    normalizedInput.currentCreativeCount +
    normalizedInput.additionalCreativeCount;
  const projectedTotalCost = currentTotalCost + appliedAdditionalCost;
  const incrementalCostPerCreative = hasReuseScenario
    ? appliedAdditionalCost / normalizedInput.additionalCreativeCount
    : null;
  const blendedCostPerCreative =
    projectedCreativeCount > 0
      ? projectedTotalCost / projectedCreativeCount
      : null;
  const dollarChangePerCreative =
    currentCostPerCreative !== null && blendedCostPerCreative !== null
      ? currentCostPerCreative - blendedCostPerCreative
      : null;
  const percentageChange =
    currentCostPerCreative !== null &&
    currentCostPerCreative > 0 &&
    dollarChangePerCreative !== null
      ? (dollarChangePerCreative / currentCostPerCreative) * 100
      : null;
  const referenceCostAtCurrentAverage =
    currentCostPerCreative === null
      ? null
      : currentCostPerCreative * projectedCreativeCount;

  return {
    additionalCreativeCount: normalizedInput.additionalCreativeCount,
    appliedAdditionalCost,
    blendedCostPerCreative,
    currentCostPerCreative,
    currentCreativeCount: normalizedInput.currentCreativeCount,
    currentTotalCost,
    differenceVersusCurrentAverage:
      referenceCostAtCurrentAverage === null
        ? null
        : referenceCostAtCurrentAverage - projectedTotalCost,
    dollarChangePerCreative,
    hasReuseScenario,
    incrementalCostPerCreative,
    percentageChange,
    projectedCreativeCount,
    projectedTotalCost,
    referenceCostAtCurrentAverage,
  };
}
