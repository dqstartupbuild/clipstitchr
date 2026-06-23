import type { StitchrHookPlanSource } from "@/lib/clipstitchr/types/StitchrHookPlanSource";

export function getStitchrHookPlanSourceLabel(source: StitchrHookPlanSource) {
  if (source === "batch_planner") {
    return "Batch";
  }

  if (source === "worker_fallback") {
    return "Fallback";
  }

  return "Manual";
}
