import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

const planOrder: PlanKey[] = ["starter", "pro", "agency"];

export function getBillingPlanActionLabel({
  currentPlanKey,
  planKey,
}: {
  currentPlanKey?: PlanKey;
  planKey: PlanKey;
}) {
  if (!currentPlanKey) {
    return `Choose ${planPolicies[planKey].name}`;
  }

  if (currentPlanKey === planKey) {
    return "Current plan";
  }

  return planOrder.indexOf(planKey) > planOrder.indexOf(currentPlanKey)
    ? `Upgrade to ${planPolicies[planKey].name} in Stripe`
    : `Change to ${planPolicies[planKey].name} in Stripe`;
}
