"use client";

import type { ReactNode } from "react";
import { OnboardingBillingShell } from "@/app/_components/onboarding/OnboardingBillingShell";
import { OnboardingPlanCheckout } from "@/app/_components/onboarding/OnboardingPlanCheckout";
import { OnboardingPlanSelection } from "@/app/_components/onboarding/OnboardingPlanSelection";
import { getOnboardingBillingView } from "@/lib/clipstitchr/billing/getOnboardingBillingView";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";
import type { SubscriptionCheckoutReturnStatus } from "@/lib/clipstitchr/billing/types/SubscriptionCheckoutReturnStatus";
import { useBillingWorkspace } from "@/lib/clipstitchr/hooks/useBillingWorkspace";
import { supportEmail } from "@/lib/supportEmail";

type OnboardingBillingGateProps = {
  billingReturn?: SubscriptionCheckoutReturnStatus;
  canceledCheckoutIntentId?: string;
  children: ReactNode;
  selectedPlanKey?: PlanKey;
};

export function OnboardingBillingGate({
  billingReturn,
  canceledCheckoutIntentId,
  children,
  selectedPlanKey,
}: OnboardingBillingGateProps) {
  const billing = useBillingWorkspace();
  const view = getOnboardingBillingView({
    billingReviewRequired: billing.entitlement?.billingReviewRequired === true,
    billingReturn,
    entitlementState: billing.entitlement?.state,
    isLoading: billing.isLoading,
    selectedPlanKey,
  });
  const isStarting = billing.pendingAction === "checkout";
  const startCheckout = (planKey: PlanKey) => {
    void billing.startPlan(
      planKey,
      "onboarding",
      billingReturn === "canceled" ? canceledCheckoutIntentId : undefined,
    );
  };

  if (view === "onboarding") {
    return children;
  }

  return (
    <OnboardingBillingShell>
      {view === "loading" ? (
        <p
          className="rounded-lg bg-surface px-5 py-6 text-sm font-semibold text-text-secondary"
          role="status"
        >
          Checking your plan...
        </p>
      ) : null}
      {view === "confirming" ? (
        <div
          className="rounded-lg bg-surface px-5 py-6 text-sm leading-6 text-text-secondary md:px-7"
          role="status"
        >
          <h2 className="text-xl font-bold text-text-primary">
            Payment received. Confirming your plan.
          </h2>
          <p className="mt-3 max-w-2xl">
            Stripe is sending the signed confirmation now. This page will open
            your product setup as soon as it arrives. You do not need to pay
            again or leave this page. If it is still here after a few minutes,
            email{" "}
            <a
              className="font-bold text-text-primary"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>
            .
          </p>
        </div>
      ) : null}
      {view === "review" ? (
        <div className="rounded-lg bg-surface px-5 py-6 text-sm leading-6 text-text-secondary md:px-7">
          <h2 className="text-xl font-bold text-text-primary">
            Your billing needs a quick review
          </h2>
          <p className="mt-3 max-w-2xl">
            New setup is paused while we confirm the payment state. Email{" "}
            <a
              className="font-bold text-text-primary"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>{" "}
            and we will help get it cleared.
          </p>
        </div>
      ) : null}
      {view === "select-plan" ? (
        <OnboardingPlanSelection
          error={billing.error}
          isStarting={isStarting}
          pendingPlanKey={billing.pendingPlanKey}
          onSelect={startCheckout}
        />
      ) : null}
      {view === "checkout" && selectedPlanKey ? (
        <OnboardingPlanCheckout
          canceledCheckoutIntentId={canceledCheckoutIntentId}
          error={billing.error}
          isCanceled={billingReturn === "canceled"}
          isStarting={isStarting}
          planKey={selectedPlanKey}
          onCheckout={() => startCheckout(selectedPlanKey)}
        />
      ) : null}
    </OnboardingBillingShell>
  );
}
