import type { AppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenInput";
import { appAdBreakEvenInputLimits } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenInputLimits";
import { normalizeAppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/normalizeAppAdBreakEvenRevenueWindow";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function normalizeAppAdBreakEvenInput(
  input: AppAdBreakEvenInput,
): AppAdBreakEvenInput {
  return {
    contributionMarginPercentage: normalizeBoundedDecimal(
      input.contributionMarginPercentage,
      appAdBreakEvenInputLimits.percentage,
    ),
    creativeProductionCost: normalizeBoundedDecimal(
      input.creativeProductionCost,
      appAdBreakEvenInputLimits.creativeCost,
    ),
    installToPaidPercentage: normalizeBoundedDecimal(
      input.installToPaidPercentage,
      appAdBreakEvenInputLimits.percentage,
    ),
    mediaSpend: normalizeBoundedDecimal(
      input.mediaSpend,
      appAdBreakEvenInputLimits.mediaSpend,
    ),
    revenuePerPayingCustomer: normalizeBoundedDecimal(
      input.revenuePerPayingCustomer,
      appAdBreakEvenInputLimits.customerRevenue,
    ),
    revenueWindow: normalizeAppAdBreakEvenRevenueWindow(input.revenueWindow),
  };
}
