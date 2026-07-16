import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";

export function updateWorkerQueueDeficits(
  deficits: Record<PlanKey, number>,
  availableLanes: PlanKey[],
  selectedLane: PlanKey,
) {
  const totalWeight = availableLanes.reduce(
    (total, lane) => total + getPlanPolicy(lane).queueWeight,
    0,
  );
  const available = new Set(availableLanes);
  const next = { ...deficits };

  for (const lane of ["starter", "pro", "agency"] as const) {
    if (available.has(lane)) {
      next[lane] += getPlanPolicy(lane).queueWeight;
    }
  }

  next[selectedLane] -= totalWeight;

  return next;
}
