import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export function getOnboardingPlanHref(planKey?: PlanKey) {
  return planKey
    ? `/dashboard/onboarding?plan=${planKey}`
    : "/dashboard/onboarding";
}
