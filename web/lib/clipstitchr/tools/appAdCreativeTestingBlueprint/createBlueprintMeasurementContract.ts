import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintMeasurementContract } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMeasurementContract";

export function createBlueprintMeasurementContract(
  input: AppAdCreativeTestingBlueprintInput,
): BlueprintMeasurementContract {
  const evidenceFloors = [
    input.minimumSpendPerVariant !== null && input.minimumSpendPerVariant > 0
      ? `$${input.minimumSpendPerVariant.toLocaleString()} of visitor-defined spend per variant`
      : null,
    input.minimumConversionEvents !== null && input.minimumConversionEvents > 0
      ? `${input.minimumConversionEvents.toLocaleString()} conversion events per variant`
      : null,
  ].filter((value): value is string => value !== null);

  return {
    primaryMetric: input.primaryMetric,
    direction: input.metricDirection,
    baseline: input.baseline,
    target: input.target,
    minimumSpendPerVariant: input.minimumSpendPerVariant,
    minimumConversionEvents: input.minimumConversionEvents,
    insufficientEvidenceMessage: evidenceFloors.length
      ? `Hold every decision until each compared cell reaches ${evidenceFloors.join(" and ")}. These are your assumptions, not ClipStitchr benchmarks.`
      : "Set a fair evidence floor before launch. Until it is reached, mark the result as insufficient evidence instead of choosing a winner.",
    fairComparisonReminders: [
      "Compare cells over the same measurement window.",
      "Give each cell comparable delivery opportunity.",
      "Keep the listed controls unchanged inside each lane.",
      "Record the learning even when no challenger wins.",
    ],
  };
}
