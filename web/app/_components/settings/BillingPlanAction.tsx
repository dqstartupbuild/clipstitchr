import { Button } from "@/app/_components/ui/Button";
import { getBillingPlanActionLabel } from "@/app/_components/settings/getBillingPlanActionLabel";
import type { BillingPlanComparisonProps } from "@/app/_components/settings/BillingPlanComparisonProps";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

type BillingPlanActionProps = Pick<
  BillingPlanComparisonProps,
  | "currentPlanKey"
  | "hasManagedSubscription"
  | "isManagingPlan"
  | "isStartingPlan"
  | "onManagePlan"
  | "onStartPlan"
  | "pendingPlanKey"
> & {
  className?: string;
  planKey: PlanKey;
};

export function BillingPlanAction({
  className,
  currentPlanKey,
  hasManagedSubscription,
  isManagingPlan,
  isStartingPlan,
  onManagePlan,
  onStartPlan,
  pendingPlanKey,
  planKey,
}: BillingPlanActionProps) {
  const managedPlanKey = hasManagedSubscription ? currentPlanKey : undefined;

  if (managedPlanKey === planKey) {
    return (
      <span className="font-semibold text-text-secondary">Current plan</span>
    );
  }

  return (
    <Button
      className={className}
      disabled={isManagingPlan || isStartingPlan}
      isLoading={
        pendingPlanKey === planKey && (isManagingPlan || isStartingPlan)
      }
      onClick={() =>
        hasManagedSubscription ? onManagePlan(planKey) : onStartPlan(planKey)
      }
      size="sm"
      variant={hasManagedSubscription ? "secondary" : "primary"}
    >
      {getBillingPlanActionLabel({
        currentPlanKey: managedPlanKey,
        planKey,
      })}
    </Button>
  );
}
