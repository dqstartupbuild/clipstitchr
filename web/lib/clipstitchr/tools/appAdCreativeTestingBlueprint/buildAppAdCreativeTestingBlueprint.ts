import type { AppAdCreativeTestingBlueprintBuild } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintBuild";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import { createBlueprintAssetGaps } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createBlueprintAssetGaps";
import { createBlueprintCells } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createBlueprintCells";
import { createBlueprintDecisionRules } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createBlueprintDecisionRules";
import { createBlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createBlueprintLane";
import { createBlueprintMeasurementContract } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createBlueprintMeasurementContract";
import { getBlueprintCellCapacity } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintCellCapacity";
import { getBlueprintMissingFields } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintMissingFields";
import { getBlueprintOrderedLaneKeys } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintOrderedLaneKeys";
import { normalizeAppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/normalizeAppAdCreativeTestingBlueprintInput";

export function buildAppAdCreativeTestingBlueprint(
  rawInput: AppAdCreativeTestingBlueprintInput,
): AppAdCreativeTestingBlueprintBuild {
  const input = normalizeAppAdCreativeTestingBlueprintInput(rawInput);
  const missingFields = getBlueprintMissingFields(input);

  if (missingFields.length > 0) {
    return { status: "incomplete", missingFields };
  }

  const lanes = getBlueprintOrderedLaneKeys(
    input.objective,
    input.campaignStage,
  ).map((key) => createBlueprintLane(key, input));
  const { activeCapacity, fundedCapacity } = getBlueprintCellCapacity(input);
  const cells = createBlueprintCells(lanes, activeCapacity);
  const activeCellCount = cells.filter(
    (cell) => cell.status === "active",
  ).length;

  return {
    status: "complete",
    result: {
      input,
      lanes,
      cells,
      activeCellCount,
      backlogCellCount: cells.length - activeCellCount,
      fundedCellCapacity: fundedCapacity,
      assetGaps: createBlueprintAssetGaps({ cells, input, lanes }),
      measurementContract: createBlueprintMeasurementContract(input),
      decisionRules: createBlueprintDecisionRules(input),
    },
  };
}
