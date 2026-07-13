import type { AppAdCreativeFatigueInput } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/AppAdCreativeFatigueInput";
import type { AppAdCreativeFatigueResult } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/AppAdCreativeFatigueResult";
import { appAdCreativeFatigueInputLimits } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/appAdCreativeFatigueInputLimits";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function calculateAppAdCreativeFatigue(
  input: AppAdCreativeFatigueInput,
): AppAdCreativeFatigueResult {
  const audienceSize = normalizeBoundedCount(
    input.audienceSize,
    appAdCreativeFatigueInputLimits.audienceSize,
  );
  const dailyImpressions = normalizeBoundedCount(
    input.dailyImpressions,
    appAdCreativeFatigueInputLimits.dailyImpressions,
  );
  const activeCreativeCount = normalizeBoundedCount(
    input.activeCreativeCount,
    appAdCreativeFatigueInputLimits.creativeCount,
  );
  const windowDays = normalizeBoundedCount(
    input.windowDays,
    appAdCreativeFatigueInputLimits.windowDays,
  );
  const frequencyCeiling = normalizeBoundedDecimal(
    input.frequencyCeiling,
    appAdCreativeFatigueInputLimits.frequencyCeiling,
  );
  const canModel = audienceSize > 0 && dailyImpressions > 0;
  const dailyFrequency = canModel ? dailyImpressions / audienceSize : null;
  const modeledFrequencyInWindow =
    dailyFrequency === null ? null : dailyFrequency * windowDays;
  const daysToFrequencyCeiling =
    dailyFrequency === null || frequencyCeiling === 0
      ? null
      : frequencyCeiling / dailyFrequency;
  const canSplitCreativeDelivery = canModel && activeCreativeCount > 0;

  return {
    activeCreativeCount,
    audienceSize,
    ceilingReachedWithinWindow:
      modeledFrequencyInWindow !== null &&
      frequencyCeiling > 0 &&
      modeledFrequencyInWindow >= frequencyCeiling,
    dailyFrequency,
    dailyImpressions,
    daysToFrequencyCeiling,
    frequencyCeiling,
    impressionsPerCreativeAtCeiling: canSplitCreativeDelivery
      ? (audienceSize * frequencyCeiling) / activeCreativeCount
      : null,
    impressionsPerCreativeInWindow: canSplitCreativeDelivery
      ? (dailyImpressions * windowDays) / activeCreativeCount
      : null,
    modeledFrequencyInWindow,
    windowDays,
  };
}
