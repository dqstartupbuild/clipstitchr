import type { PlanKey } from "./types/PlanKey";
import type { SubscriptionCheckoutReturnTarget } from "./types/SubscriptionCheckoutReturnTarget";

export function getSubscriptionCheckoutReturnUrls({
  appUrl,
  planKey,
  returnTarget,
}: {
  appUrl: string;
  planKey: PlanKey;
  returnTarget: SubscriptionCheckoutReturnTarget;
}) {
  if (returnTarget === "onboarding") {
    const onboardingUrl = `${appUrl}/dashboard/onboarding?plan=${planKey}`;

    return {
      cancelUrl: `${onboardingUrl}&billing=canceled`,
      successUrl: `${onboardingUrl}&billing=success`,
    };
  }

  return {
    cancelUrl: `${appUrl}/dashboard/settings?billing=canceled`,
    successUrl: `${appUrl}/dashboard/settings?billing=success`,
  };
}
