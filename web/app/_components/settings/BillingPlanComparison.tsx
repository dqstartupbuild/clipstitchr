import { Button } from "@/app/_components/ui/Button";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

type BillingPlanComparisonProps = {
  currentPlanKey?: PlanKey;
  hasManagedSubscription: boolean;
  isStartingPlan: boolean;
  onStartPlan: (planKey: PlanKey) => void;
};

const planKeys: PlanKey[] = ["starter", "pro", "agency"];

export function BillingPlanComparison({
  currentPlanKey,
  hasManagedSubscription,
  isStartingPlan,
  onStartPlan,
}: BillingPlanComparisonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-text-secondary">
            <th className="border-b border-border px-3 py-3 font-semibold">
              Plan
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Monthly
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Products
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Credits
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Clipr + Swapr
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Daily drafts
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              At once
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Queue
            </th>
            <th className="border-b border-border px-3 py-3 font-semibold">
              Stitches
            </th>
            {!hasManagedSubscription ? (
              <th className="border-b border-border px-3 py-3">
                <span className="sr-only">Choose plan</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {planKeys.map((planKey) => {
            const policy = planPolicies[planKey];
            const isCurrent = currentPlanKey === planKey;

            return (
              <tr key={planKey} className={isCurrent ? "bg-surface-muted" : ""}>
                <th className="border-b border-border px-3 py-4 text-text-primary">
                  <span className="font-bold">{policy.name}</span>
                  {isCurrent ? (
                    <span className="ml-2 text-xs font-semibold text-accent-dark">
                      Current
                    </span>
                  ) : null}
                </th>
                <td className="border-b border-border px-3 py-4 font-bold text-text-primary">
                  ${policy.monthlyPriceUsd}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.productLimit}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.monthlyCreationCredits.toLocaleString()}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.aiVideoLimit} videos
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.dailyDraftProductLimit === 0
                    ? "None"
                    : `${policy.dailyDraftProductLimit} product${
                        policy.dailyDraftProductLimit === 1 ? "" : "s"
                      }`}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.activeGenerationLimit}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {policy.queueLabel}
                </td>
                <td className="border-b border-border px-3 py-4">
                  {planKey === "agency" ? "Unlimited" : "10 credits each"}
                </td>
                {!hasManagedSubscription ? (
                  <td className="border-b border-border px-3 py-4 text-right">
                    <Button
                      size="sm"
                      disabled={isStartingPlan}
                      isLoading={isStartingPlan}
                      onClick={() => onStartPlan(planKey)}
                    >
                      Choose {policy.name}
                    </Button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
