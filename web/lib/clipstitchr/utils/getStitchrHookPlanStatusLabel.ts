import type { StitchrHookPlanStatus } from "@/lib/clipstitchr/types/StitchrHookPlanStatus";

export function getStitchrHookPlanStatusLabel(status: StitchrHookPlanStatus) {
  if (status === "planned") {
    return "Ready";
  }

  if (status === "fallback") {
    return "Fallback";
  }

  return "Needs retry";
}
