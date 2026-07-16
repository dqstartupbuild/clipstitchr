import { planPolicies } from "./planPolicies";
import type { PlanKey } from "./types/PlanKey";

export function getPlanPolicy(planKey: PlanKey) {
  return planPolicies[planKey];
}
