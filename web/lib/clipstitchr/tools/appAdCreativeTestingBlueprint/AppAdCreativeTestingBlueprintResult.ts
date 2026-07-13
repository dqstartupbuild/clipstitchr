import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintAssetGap } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetGap";
import type { BlueprintCell } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCell";
import type { BlueprintDecisionRule } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintDecisionRule";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";
import type { BlueprintMeasurementContract } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMeasurementContract";

export type AppAdCreativeTestingBlueprintResult = {
  input: AppAdCreativeTestingBlueprintInput;
  lanes: BlueprintLane[];
  cells: BlueprintCell[];
  activeCellCount: number;
  backlogCellCount: number;
  fundedCellCapacity: number | null;
  assetGaps: BlueprintAssetGap[];
  measurementContract: BlueprintMeasurementContract;
  decisionRules: BlueprintDecisionRule[];
};
