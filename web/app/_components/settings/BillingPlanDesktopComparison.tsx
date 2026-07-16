import { BillingPlanAction } from "@/app/_components/settings/BillingPlanAction";
import type { BillingPlanComparisonProps } from "@/app/_components/settings/BillingPlanComparisonProps";
import { billingPlanKeys } from "@/app/_components/settings/billingPlanKeys";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";

export function BillingPlanDesktopComparison(
  props: BillingPlanComparisonProps,
) {
  const managedPlanKey = props.hasManagedSubscription
    ? props.currentPlanKey
    : undefined;

  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">
          Compare ClipStitchr monthly plans and allowances
        </caption>
        <thead>
          <tr className="text-text-secondary">
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Plan
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Monthly
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Products
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Credits
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Clipr + Swapr
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Daily drafts
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Active creations
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Processing
            </th>
            <th
              className="border-b border-border px-2 py-3 font-semibold"
              scope="col"
            >
              Stitches
            </th>
            <th
              className="border-b border-border px-2 py-3"
              scope="col"
            >
              <span className="sr-only">Plan action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {billingPlanKeys.map((planKey) => {
            const policy = planPolicies[planKey];
            const isCurrent = managedPlanKey === planKey;

            return (
              <tr key={planKey} className={isCurrent ? "bg-surface-muted" : ""}>
                <th
                  className="border-b border-border px-2 py-4 text-text-primary"
                  scope="row"
                >
                  <span className="font-bold">{policy.name}</span>
                  {isCurrent ? (
                    <span className="ml-2 text-xs font-semibold text-accent-dark">
                      Current
                    </span>
                  ) : null}
                </th>
                <td className="border-b border-border px-2 py-4 font-bold text-text-primary">
                  ${policy.monthlyPriceUsd}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.productLimit}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.monthlyCreationCredits.toLocaleString()}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.aiVideoLimit} videos
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.dailyDraftProductLimit === 0
                    ? "None"
                    : `${policy.dailyDraftProductLimit} product${
                        policy.dailyDraftProductLimit === 1 ? "" : "s"
                      }`}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.activeGenerationLimit}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {policy.queueLabel}
                </td>
                <td className="border-b border-border px-2 py-4">
                  {planKey === "agency" ? "Unlimited" : "10 credits each"}
                </td>
                <td className="border-b border-border px-2 py-4 text-right">
                  <BillingPlanAction {...props} planKey={planKey} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
