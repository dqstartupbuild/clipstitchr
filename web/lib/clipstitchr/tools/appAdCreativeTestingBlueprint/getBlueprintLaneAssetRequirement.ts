import type { BlueprintAssetInventory } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintAssetInventory";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";

export function getBlueprintLaneAssetRequirement(
  lane: BlueprintLane,
  activeCellCount: number,
): BlueprintAssetInventory {
  if (activeCellCount === 0) {
    return { ugcOpenings: 0, demos: 0, proofAssets: 0, hooks: 0, ctas: 0 };
  }

  const requirement: BlueprintAssetInventory = {
    ugcOpenings: 1,
    demos: 1,
    proofAssets: 0,
    hooks: 1,
    ctas: 1,
  };
  requirement[lane.variableAssetKey] = Math.max(
    requirement[lane.variableAssetKey],
    activeCellCount,
  );

  return requirement;
}
