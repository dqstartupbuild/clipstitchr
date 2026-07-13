import type { AdVariantCalculatorInput } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorInput";
import type { AdVariantCalculatorResult } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorResult";
import { createAdVariantTestPhases } from "@/lib/clipstitchr/tools/adVariantCalculator/createAdVariantTestPhases";
import { normalizeAdVariantCount } from "@/lib/clipstitchr/tools/adVariantCalculator/normalizeAdVariantCount";

export function calculateAdVariantPlan(
  input: AdVariantCalculatorInput,
): AdVariantCalculatorResult {
  const normalizedInput: AdVariantCalculatorInput = {
    callToActionCount: normalizeAdVariantCount(input.callToActionCount),
    demoClipCount: normalizeAdVariantCount(input.demoClipCount),
    hookCount: normalizeAdVariantCount(input.hookCount),
    ugcClipCount: normalizeAdVariantCount(input.ugcClipCount),
  };
  const pairingCount =
    normalizedInput.ugcClipCount * normalizedInput.demoClipCount;
  const possibleCombinationCount =
    pairingCount *
    normalizedInput.hookCount *
    normalizedInput.callToActionCount;
  const practicalFirstBatchCount = normalizedInput.demoClipCount
    ? Math.min(normalizedInput.ugcClipCount, 20)
    : 0;

  return {
    pairingCount,
    possibleCombinationCount,
    practicalFirstBatchCount,
    testPhases: createAdVariantTestPhases(
      normalizedInput,
      practicalFirstBatchCount,
    ),
  };
}
