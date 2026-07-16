import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export type BillingPlanComparisonProps = {
  currentPlanKey?: PlanKey;
  hasManagedSubscription: boolean;
  isManagingPlan: boolean;
  isStartingPlan: boolean;
  pendingPlanKey?: PlanKey | null;
  onManagePlan: (planKey: PlanKey) => void;
  onStartPlan: (planKey: PlanKey) => void;
};
