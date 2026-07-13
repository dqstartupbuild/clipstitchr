import type { BlueprintCampaignStage } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCampaignStage";
import type { BlueprintLaneKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLaneKey";
import type { BlueprintTestingObjective } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintTestingObjective";
import { blueprintObjectiveLaneMap } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/blueprintObjectiveLaneMap";

export function getBlueprintOrderedLaneKeys(
  objective: BlueprintTestingObjective,
  stage: BlueprintCampaignStage,
): BlueprintLaneKey[] {
  const lanes = [...blueprintObjectiveLaneMap[objective]];

  if (stage === "learning") {
    return [lanes[1], lanes[0], lanes[2]];
  }

  if (stage === "scaling") {
    return [lanes[2], lanes[0], lanes[1]];
  }

  if (stage === "refreshing") {
    return lanes.reverse();
  }

  return lanes;
}
