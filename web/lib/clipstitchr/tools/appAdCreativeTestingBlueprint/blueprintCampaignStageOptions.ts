import type { BlueprintCampaignStage } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCampaignStage";

export const blueprintCampaignStageOptions: Array<{
  label: string;
  value: BlueprintCampaignStage;
}> = [
  { label: "New campaign", value: "new" },
  { label: "Learning", value: "learning" },
  { label: "Scaling", value: "scaling" },
  { label: "Refreshing", value: "refreshing" },
];
