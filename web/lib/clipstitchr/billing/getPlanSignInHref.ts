import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export function getPlanSignInHref(planKey: PlanKey) {
  return `/sign-in?plan=${planKey}`;
}
