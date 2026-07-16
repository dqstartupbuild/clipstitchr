import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";

const laneOrder: PlanKey[] = ["agency", "pro", "starter"];

export function getWeightedQueueLane({
  availableLanes,
  deficits,
  laneQueuedAt,
  now,
}: {
  availableLanes: PlanKey[];
  deficits: Record<PlanKey, number>;
  laneQueuedAt: Partial<Record<PlanKey, string>>;
  now: string;
}) {
  const available = new Set(availableLanes);
  const nowMs = Date.parse(now);
  const starterAge = laneQueuedAt.starter
    ? nowMs - Date.parse(laneQueuedAt.starter)
    : 0;
  const proAge = laneQueuedAt.pro ? nowMs - Date.parse(laneQueuedAt.pro) : 0;

  if (available.has("starter") && starterAge >= 5 * 60_000) {
    return "starter" as const;
  }

  if (available.has("pro") && proAge >= 3 * 60_000) {
    return "pro" as const;
  }

  const replenished = Object.fromEntries(
    laneOrder.map((lane) => [
      lane,
      deficits[lane] + (available.has(lane) ? getPlanPolicy(lane).queueWeight : 0),
    ]),
  ) as Record<PlanKey, number>;

  return laneOrder
    .filter((lane) => available.has(lane))
    .sort((left, right) => replenished[right] - replenished[left])[0];
}
