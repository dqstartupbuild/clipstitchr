import Link from "next/link";
import { Button } from "@/app/_components/ui/Button";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

type OnboardingPlanCheckoutProps = {
  error: string | null;
  isCanceled: boolean;
  isStarting: boolean;
  planKey: PlanKey;
  onCheckout: () => void;
};

export function OnboardingPlanCheckout({
  error,
  isCanceled,
  isStarting,
  planKey,
  onCheckout,
}: OnboardingPlanCheckoutProps) {
  const policy = planPolicies[planKey];

  return (
    <section
      aria-labelledby="selected-plan-title"
      className="rounded-lg bg-surface px-5 py-6 md:px-7"
    >
      {isCanceled ? (
        <p className="mb-5 rounded-lg bg-surface-muted px-4 py-3 text-sm font-semibold text-text-primary">
          Nothing was charged. Your {policy.name} choice is still here.
        </p>
      ) : null}
      <h2 id="selected-plan-title" className="text-xl font-bold text-text-primary">
        {policy.name} is selected
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ${policy.monthlyPriceUsd} per month includes {policy.productLimit} {" "}
        product{policy.productLimit === 1 ? "" : "s"}, {" "}
        {policy.monthlyCreationCredits.toLocaleString()} creation credits, and {" "}
        {policy.aiVideoLimit} combined Clipr or Swapr videos.
      </p>
      <p className="mt-4 text-sm leading-6 text-text-secondary">
        Stripe handles payment details. ClipStitchr unlocks setup only after the
        signed payment confirmation arrives.
      </p>
      {error ? (
        <p
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          className="w-full sm:w-auto"
          isLoading={isStarting}
          onClick={onCheckout}
        >
          Continue to secure checkout
        </Button>
        <Link
          className="text-center text-sm font-semibold text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-text-primary sm:text-left"
          href="/dashboard/onboarding"
        >
          Change plan
        </Link>
      </div>
    </section>
  );
}
