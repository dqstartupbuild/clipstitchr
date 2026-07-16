import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export function getPlanSignupHref(planKey: PlanKey) {
  return `/sign-up?plan=${planKey}`;
}
