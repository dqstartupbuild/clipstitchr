import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import { appAdCreativeTestingBlueprintFieldLimits } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintFieldLimits";
import { normalizeBlueprintCount } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/normalizeBlueprintCount";
import { normalizeBlueprintOptionalCount } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/normalizeBlueprintOptionalCount";
import { normalizeBlueprintOptionalNumber } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/normalizeBlueprintOptionalNumber";

export function normalizeAppAdCreativeTestingBlueprintInput(
  input: AppAdCreativeTestingBlueprintInput,
): AppAdCreativeTestingBlueprintInput {
  return {
    ...input,
    appName: input.appName.trim(),
    audience: input.audience.trim(),
    productOutcome: input.productOutcome.trim(),
    mainObjection: input.mainObjection.trim(),
    approvedProof: input.approvedProof.trim(),
    primaryMetric: input.primaryMetric.trim(),
    baseline: normalizeBlueprintOptionalNumber(
      input.baseline,
      appAdCreativeTestingBlueprintFieldLimits.metricValue,
    ),
    target: normalizeBlueprintOptionalNumber(
      input.target,
      appAdCreativeTestingBlueprintFieldLimits.metricValue,
    ),
    ugcOpenings: normalizeBlueprintCount(
      input.ugcOpenings,
      appAdCreativeTestingBlueprintFieldLimits.assetCount,
    ),
    demos: normalizeBlueprintCount(
      input.demos,
      appAdCreativeTestingBlueprintFieldLimits.assetCount,
    ),
    proofAssets: normalizeBlueprintCount(
      input.proofAssets,
      appAdCreativeTestingBlueprintFieldLimits.assetCount,
    ),
    hooks: normalizeBlueprintCount(
      input.hooks,
      appAdCreativeTestingBlueprintFieldLimits.assetCount,
    ),
    ctas: normalizeBlueprintCount(
      input.ctas,
      appAdCreativeTestingBlueprintFieldLimits.assetCount,
    ),
    weeklyProductionCapacity: normalizeBlueprintCount(
      input.weeklyProductionCapacity,
      appAdCreativeTestingBlueprintFieldLimits.weeklyProductionCapacity,
    ),
    weeklyBudget: normalizeBlueprintOptionalNumber(
      input.weeklyBudget,
      appAdCreativeTestingBlueprintFieldLimits.money,
    ),
    minimumSpendPerVariant: normalizeBlueprintOptionalNumber(
      input.minimumSpendPerVariant,
      appAdCreativeTestingBlueprintFieldLimits.money,
    ),
    minimumConversionEvents: normalizeBlueprintOptionalCount(
      input.minimumConversionEvents,
      appAdCreativeTestingBlueprintFieldLimits.conversionEvents,
    ),
  };
}
