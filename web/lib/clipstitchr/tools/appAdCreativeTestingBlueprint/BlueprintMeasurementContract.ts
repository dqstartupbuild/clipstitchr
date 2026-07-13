import type { BlueprintMetricDirection } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMetricDirection";

export type BlueprintMeasurementContract = {
  primaryMetric: string;
  direction: BlueprintMetricDirection;
  baseline: number | null;
  target: number | null;
  minimumSpendPerVariant: number | null;
  minimumConversionEvents: number | null;
  insufficientEvidenceMessage: string;
  fairComparisonReminders: string[];
};
