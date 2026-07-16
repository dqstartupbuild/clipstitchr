import type { Metadata } from "next";
import { OnboardingBillingGate } from "@/app/_components/onboarding/OnboardingBillingGate";
import { OnboardingPageClient } from "@/app/dashboard/onboarding/OnboardingPageClient";
import { getPlanKeyFromSearchParam } from "@/lib/clipstitchr/billing/getPlanKeyFromSearchParam";
import { getCheckoutIntentIdFromSearchParam } from "@/lib/clipstitchr/billing/getCheckoutIntentIdFromSearchParam";
import { getSubscriptionCheckoutReturnStatus } from "@/lib/clipstitchr/billing/getSubscriptionCheckoutReturnStatus";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `First Ads Setup | ${site.name}`,
  description:
    "Set up a product, upload Hook/UGC and demo clips, review the scores, and make your first ClipStitchr ads.",
  canonical: "/dashboard/onboarding",
  noIndex: true,
});

type OnboardingPageProps = {
  searchParams?: Promise<{
    billing?: string | string[];
    checkout_intent?: string | string[];
    plan?: string | string[];
  }>;
};

export default async function OnboardingPage({
  searchParams = Promise.resolve({}),
}: OnboardingPageProps = {}) {
  const resolvedSearchParams = await searchParams;

  return (
    <OnboardingBillingGate
      billingReturn={getSubscriptionCheckoutReturnStatus(
        resolvedSearchParams.billing,
      )}
      canceledCheckoutIntentId={getCheckoutIntentIdFromSearchParam(
        resolvedSearchParams.checkout_intent,
      )}
      selectedPlanKey={getPlanKeyFromSearchParam(resolvedSearchParams.plan)}
    >
      <OnboardingPageClient />
    </OnboardingBillingGate>
  );
}
