import type { AppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeInput";
import { appAdCostPerCreativeInputLimits } from "@/lib/clipstitchr/tools/appAdCostPerCreative/appAdCostPerCreativeInputLimits";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function normalizeAppAdCostPerCreativeInput(
  input: AppAdCostPerCreativeInput,
): AppAdCostPerCreativeInput {
  return {
    additionalCreativeCount: normalizeBoundedCount(
      input.additionalCreativeCount,
      appAdCostPerCreativeInputLimits.creativeCount,
    ),
    additionalFinishingCost: normalizeBoundedDecimal(
      input.additionalFinishingCost,
      appAdCostPerCreativeInputLimits.money,
    ),
    currentCreativeCount: normalizeBoundedCount(
      input.currentCreativeCount,
      appAdCostPerCreativeInputLimits.creativeCount,
    ),
    editingCost: normalizeBoundedDecimal(
      input.editingCost,
      appAdCostPerCreativeInputLimits.money,
    ),
    internalCost: normalizeBoundedDecimal(
      input.internalCost,
      appAdCostPerCreativeInputLimits.money,
    ),
    otherCost: normalizeBoundedDecimal(
      input.otherCost,
      appAdCostPerCreativeInputLimits.money,
    ),
    sourceFootageCost: normalizeBoundedDecimal(
      input.sourceFootageCost,
      appAdCostPerCreativeInputLimits.money,
    ),
  };
}
