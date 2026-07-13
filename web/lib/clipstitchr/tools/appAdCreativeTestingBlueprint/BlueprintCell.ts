import type { BlueprintCellStatus } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCellStatus";
import type { BlueprintLaneKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLaneKey";

export type BlueprintCell = {
  id: string;
  laneKey: BlueprintLaneKey;
  label: "Control" | "Challenger A" | "Challenger B";
  direction: string;
  changedVariable: string;
  fixedControls: string[];
  status: BlueprintCellStatus;
};
