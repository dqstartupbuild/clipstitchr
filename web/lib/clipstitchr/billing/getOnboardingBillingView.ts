import type { EntitlementState } from "@/lib/clipstitchr/billing/types/EntitlementState";
import type { OnboardingBillingView } from "@/lib/clipstitchr/billing/types/OnboardingBillingView";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";
import type { SubscriptionCheckoutReturnStatus } from "@/lib/clipstitchr/billing/types/SubscriptionCheckoutReturnStatus";

export function getOnboardingBillingView({
  billingReviewRequired,
  billingReturn,
  entitlementState,
  isLoading,
  selectedPlanKey,
}: {
  billingReviewRequired: boolean;
  billingReturn?: SubscriptionCheckoutReturnStatus;
  entitlementState?: EntitlementState;
  isLoading: boolean;
  selectedPlanKey?: PlanKey;
}): OnboardingBillingView {
  if (isLoading) {
    return "loading";
  }

  if (billingReviewRequired) {
    return "review";
  }

  if (entitlementState === "active" || entitlementState === "grace") {
    return "onboarding";
  }

  if (billingReturn === "success") {
    return "confirming";
  }

  return selectedPlanKey ? "checkout" : "select-plan";
}
