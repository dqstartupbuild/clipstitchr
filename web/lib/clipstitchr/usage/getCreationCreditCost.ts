import { getPlanPolicy } from "../billing/getPlanPolicy";
import type { PlanKey } from "../billing/types/PlanKey";
import type { UsageOperation } from "./types/UsageOperation";

export function getCreationCreditCost(
  planKey: PlanKey,
  operation: UsageOperation,
) {
  const policy = getPlanPolicy(planKey);

  switch (operation) {
    case "stitch":
      return policy.stitchCreditCost;
    case "swipr":
      return policy.swiprCreditCost;
    case "avatar_photo":
    case "background_photo":
    case "photo_expansion":
      return policy.standalonePhotoCreditCost;
    case "ai_analysis":
    case "hook_lab_analysis":
      return 1;
    case "clipr_video":
    case "swapr_video":
      return 0;
  }
}
