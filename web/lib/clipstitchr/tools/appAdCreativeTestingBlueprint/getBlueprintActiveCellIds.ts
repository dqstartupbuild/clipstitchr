import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";

export function getBlueprintActiveCellIds(
  lanes: BlueprintLane[],
  activeCapacity: number,
): Set<string> {
  const activeIds = new Set<string>();

  if (activeCapacity === 1 && lanes[0]) {
    activeIds.add(`${lanes[0].key}-control`);
    return activeIds;
  }

  const pairCount = Math.min(lanes.length, Math.floor(activeCapacity / 2));
  for (let index = 0; index < pairCount; index += 1) {
    const lane = lanes[index];
    activeIds.add(`${lane.key}-control`);
    activeIds.add(`${lane.key}-challenger-a`);
  }

  let remaining = activeCapacity - pairCount * 2;
  for (let index = 0; index < pairCount && remaining > 0; index += 1) {
    activeIds.add(`${lanes[index].key}-challenger-b`);
    remaining -= 1;
  }

  return activeIds;
}
