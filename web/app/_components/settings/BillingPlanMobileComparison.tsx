import { BillingPlanAction } from "@/app/_components/settings/BillingPlanAction";
import type { BillingPlanComparisonProps } from "@/app/_components/settings/BillingPlanComparisonProps";
import { billingPlanKeys } from "@/app/_components/settings/billingPlanKeys";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";

export function BillingPlanMobileComparison(props: BillingPlanComparisonProps) {
  const managedPlanKey = props.hasManagedSubscription
    ? props.currentPlanKey
    : undefined;

  return (
    <div className="xl:hidden">
      {billingPlanKeys.map((planKey) => {
        const policy = planPolicies[planKey];
        const isCurrent = managedPlanKey === planKey;
        const headingId = `billing-plan-${planKey}`;

        return (
          <section
            aria-labelledby={headingId}
            className="border-b border-border py-5 first:pt-0 last:border-0 last:pb-0"
            key={planKey}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-text-primary" id={headingId}>
                {policy.name}
                {isCurrent ? (
                  <span className="ml-2 text-xs font-semibold text-accent-dark">
                    Current
                  </span>
                ) : null}
              </h3>
              <p className="font-bold text-text-primary">
                ${policy.monthlyPriceUsd}/month
              </p>
            </div>

            <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 text-sm">
              <dt className="py-2 text-text-secondary">Products</dt>
              <dd className="py-2 text-right">{policy.productLimit}</dd>
              <dt className="py-2 text-text-secondary">Credits</dt>
              <dd className="py-2 text-right">
                {policy.monthlyCreationCredits.toLocaleString()}
              </dd>
              <dt className="py-2 text-text-secondary">Clipr + Swapr</dt>
              <dd className="py-2 text-right">{policy.aiVideoLimit} videos</dd>
              <dt className="py-2 text-text-secondary">Daily drafts</dt>
              <dd className="py-2 text-right">
                {policy.dailyDraftProductLimit === 0
                  ? "None"
                  : `${policy.dailyDraftProductLimit} product${
                      policy.dailyDraftProductLimit === 1 ? "" : "s"
                    }`}
              </dd>
              <dt className="py-2 text-text-secondary">Active creations</dt>
              <dd className="py-2 text-right">
                {policy.activeGenerationLimit}
              </dd>
              <dt className="py-2 text-text-secondary">Processing</dt>
              <dd className="py-2 text-right">{policy.queueLabel}</dd>
              <dt className="py-2 text-text-secondary">Stitches</dt>
              <dd className="py-2 text-right">
                {planKey === "agency" ? "Unlimited" : "10 credits each"}
              </dd>
            </dl>

            <div className="mt-3 flex justify-end">
              <BillingPlanAction
                {...props}
                className="w-full whitespace-normal sm:w-auto"
                planKey={planKey}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
