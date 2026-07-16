import { BillingRenewalDisclosure } from "@/app/_components/billing/BillingRenewalDisclosure";
import { Button } from "@/app/_components/ui/Button";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

type OnboardingPlanSelectionProps = {
  error?: string | null;
  isStarting: boolean;
  pendingPlanKey?: PlanKey | null;
  onSelect: (planKey: PlanKey) => void;
};

const planKeys: PlanKey[] = ["starter", "pro", "agency"];

export function OnboardingPlanSelection({
  error,
  isStarting,
  pendingPlanKey,
  onSelect,
}: OnboardingPlanSelectionProps) {
  return (
    <section
      aria-labelledby="onboarding-plan-selection-title"
      className="rounded-lg bg-surface px-5 py-6 md:px-7"
    >
      <h2
        id="onboarding-plan-selection-title"
        className="text-xl font-bold text-text-primary"
      >
        Choose your monthly plan
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        You can change plans later in Settings. Upgrades apply after Stripe
        confirms payment, and downgrades begin at your next renewal.
      </p>
      <BillingRenewalDisclosure className="mt-2 text-sm leading-6 text-text-secondary" />
      {error ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-6 divide-y divide-border">
        {planKeys.map((planKey) => {
          const policy = planPolicies[planKey];

          return (
            <div
              className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
              key={planKey}
            >
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold text-text-primary">
                    {policy.name}
                  </h3>
                  <p className="font-bold text-text-primary">
                    ${policy.monthlyPriceUsd}/month
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {policy.productLimit} product
                  {policy.productLimit === 1 ? "" : "s"},{" "}
                  {policy.monthlyCreationCredits.toLocaleString()} credits, and{" "}
                  {policy.aiVideoLimit} Clipr or Swapr videos each month.
                </p>
              </div>
              <Button
                disabled={isStarting}
                isLoading={isStarting && pendingPlanKey === planKey}
                onClick={() => onSelect(planKey)}
              >
                Choose {policy.name}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
