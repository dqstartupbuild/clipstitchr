import type { BlueprintAssetKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetKey";
import type { BlueprintLaneKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLaneKey";

export type BlueprintLane = {
  key: BlueprintLaneKey;
  title: string;
  learningQuestion: string;
  hypothesis: string;
  changedVariable: string;
  fixedControls: string[];
  controlDirection: string;
  challengerDirections: [string, string];
  leadingSignal: string;
  primarySignal: string;
  nextLearningAction: string;
  variableAssetKey: BlueprintAssetKey;
};
