import type { BlueprintCell } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintCell";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";
import { getBlueprintActiveCellIds } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintActiveCellIds";

export function createBlueprintCells(
  lanes: BlueprintLane[],
  activeCapacity: number,
): BlueprintCell[] {
  const activeIds = getBlueprintActiveCellIds(lanes, activeCapacity);

  return lanes.flatMap((lane) => {
    const directions = [
      { id: "control", label: "Control" as const, text: lane.controlDirection },
      {
        id: "challenger-a",
        label: "Challenger A" as const,
        text: lane.challengerDirections[0],
      },
      {
        id: "challenger-b",
        label: "Challenger B" as const,
        text: lane.challengerDirections[1],
      },
    ];

    return directions.map(({ id, label, text }) => {
      const cellId = `${lane.key}-${id}`;

      return {
        id: cellId,
        laneKey: lane.key,
        label,
        direction: text,
        changedVariable: lane.changedVariable,
        fixedControls: [...lane.fixedControls],
        status: activeIds.has(cellId) ? "active" : "backlog",
      };
    });
  });
}
