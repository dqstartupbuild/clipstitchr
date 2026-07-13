import type { BlueprintAssetInventory } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetInventory";
import type { BlueprintCampaignStage } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCampaignStage";
import type { BlueprintMetricDirection } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMetricDirection";
import type { BlueprintTestingObjective } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintTestingObjective";

export type AppAdCreativeTestingBlueprintInput = BlueprintAssetInventory & {
  appName: string;
  audience: string;
  productOutcome: string;
  mainObjection: string;
  approvedProof: string;
  objective: BlueprintTestingObjective;
  campaignStage: BlueprintCampaignStage;
  primaryMetric: string;
  metricDirection: BlueprintMetricDirection;
  baseline: number | null;
  target: number | null;
  weeklyProductionCapacity: number;
  weeklyBudget: number | null;
  minimumSpendPerVariant: number | null;
  minimumConversionEvents: number | null;
};
