import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintAssetGap } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetGap";
import type { BlueprintAssetInventory } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetInventory";
import type { BlueprintAssetKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetKey";
import type { BlueprintCell } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCell";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";
import { blueprintAssetLabels } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/blueprintAssetLabels";
import { getBlueprintLaneAssetRequirement } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintLaneAssetRequirement";

export function createBlueprintAssetGaps({
  cells,
  input,
  lanes,
}: {
  cells: BlueprintCell[];
  input: AppAdCreativeTestingBlueprintInput;
  lanes: BlueprintLane[];
}): BlueprintAssetGap[] {
  const required: BlueprintAssetInventory = {
    ugcOpenings: 0,
    demos: 0,
    proofAssets: 0,
    hooks: 0,
    ctas: 0,
  };
  const keys = Object.keys(required) as BlueprintAssetKey[];

  lanes.forEach((lane) => {
    const activeCellCount = cells.filter(
      (cell) => cell.laneKey === lane.key && cell.status === "active",
    ).length;
    const laneRequirement = getBlueprintLaneAssetRequirement(
      lane,
      activeCellCount,
    );
    keys.forEach((key) => {
      required[key] = Math.max(required[key], laneRequirement[key]);
    });
  });

  return keys.map((key) => {
    const available =
      key === "proofAssets" && !input.approvedProof ? 0 : input[key];
    const gap = Math.max(required[key] - available, 0);

    return {
      key,
      label: blueprintAssetLabels[key],
      required: required[key],
      available,
      gap,
      guidance:
        key === "proofAssets" && !input.approvedProof && required[key] > 0
          ? "Capture or verify proof before using it. Do not strengthen an unsupported claim."
          : gap > 0
            ? `Prepare ${gap} more ${blueprintAssetLabels[key].toLowerCase()} for the active cells.`
            : "Available for the active cells.",
    };
  });
}
