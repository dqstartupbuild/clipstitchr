import type { PlanKey } from "./types/PlanKey";
import type { SubscriptionCheckoutReturnTarget } from "./types/SubscriptionCheckoutReturnTarget";

export function getSubscriptionCheckoutReturnUrls({
  appUrl,
  checkoutIntentId,
  planKey,
  returnTarget,
}: {
  appUrl: string;
  checkoutIntentId: string;
  planKey: PlanKey;
  returnTarget: SubscriptionCheckoutReturnTarget;
}) {
  if (returnTarget === "onboarding") {
    const onboardingUrl = `${appUrl}/dashboard/onboarding?plan=${planKey}`;

    return {
      cancelUrl: `${onboardingUrl}&billing=canceled&checkout_intent=${encodeURIComponent(checkoutIntentId)}`,
      successUrl: `${onboardingUrl}&billing=success`,
    };
  }

  return {
    cancelUrl: `${appUrl}/dashboard/settings?billing=canceled&checkout_intent=${encodeURIComponent(checkoutIntentId)}`,
    successUrl: `${appUrl}/dashboard/settings?billing=success`,
  };
}
