import { SignUp } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { authComponentAppearance } from "@/app/_components/auth/authComponentAppearance";
import { getOnboardingPlanHref } from "@/lib/clipstitchr/billing/getOnboardingPlanHref";
import { getPlanSignInHref } from "@/lib/clipstitchr/billing/getPlanSignInHref";
import { getPlanKeyFromSearchParam } from "@/lib/clipstitchr/billing/getPlanKeyFromSearchParam";
import { planPolicies } from "@/lib/clipstitchr/billing/planPolicies";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Create your account | ClipStitchr",
  description:
    "Create a ClipStitchr account, choose your plan securely, and turn raw clips into ready-to-post ads.",
  canonical: "/sign-up",
  noIndex: true,
});

type SignUpPageProps = {
  searchParams?: Promise<{ plan?: string | string[] }>;
};

export default async function SignUpPage({
  searchParams = Promise.resolve({}),
}: SignUpPageProps = {}) {
  const selectedPlanKey = getPlanKeyFromSearchParam((await searchParams).plan);
  const onboardingHref = getOnboardingPlanHref(selectedPlanKey);
  const selectedPlan = selectedPlanKey
    ? planPolicies[selectedPlanKey]
    : undefined;

  return (
    <AuthPageShell
      eyebrow={
        selectedPlan
          ? `${selectedPlan.name} plan selected`
          : "Your ClipStitchr workspace"
      }
      title="Create your account."
      description={
        selectedPlan
          ? `${selectedPlan.name} is $${selectedPlan.monthlyPriceUsd} per month. Create your account, then review the plan before secure checkout.`
          : "Keep your clips, drafts, and finished ads together. Choose your plan securely before setup begins."
      }
    >
      <SignUp
        appearance={authComponentAppearance}
        fallbackRedirectUrl={onboardingHref}
        forceRedirectUrl={onboardingHref}
        path="/sign-up"
        routing="path"
        signInFallbackRedirectUrl={onboardingHref}
        signInForceRedirectUrl={onboardingHref}
        signInUrl={
          selectedPlanKey ? getPlanSignInHref(selectedPlanKey) : "/sign-in"
        }
      />
    </AuthPageShell>
  );
}
