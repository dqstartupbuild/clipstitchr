import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { authComponentAppearance } from "@/app/_components/auth/authComponentAppearance";
import { getOnboardingPlanHref } from "@/lib/clipstitchr/billing/getOnboardingPlanHref";
import { getPlanKeyFromSearchParam } from "@/lib/clipstitchr/billing/getPlanKeyFromSearchParam";
import { getPlanSignupHref } from "@/lib/clipstitchr/billing/getPlanSignupHref";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sign in | ClipStitchr",
  description:
    "Sign in to ClipStitchr to manage Hook/UGC clips, product demos, drafts, and finished Stitches.",
  canonical: "/sign-in",
  noIndex: true,
});

type SignInPageProps = {
  searchParams?: Promise<{ plan?: string | string[] }>;
};

export default async function SignInPage({
  searchParams = Promise.resolve({}),
}: SignInPageProps = {}) {
  const selectedPlanKey = getPlanKeyFromSearchParam((await searchParams).plan);
  const planRedirectHref = selectedPlanKey
    ? getOnboardingPlanHref(selectedPlanKey)
    : "/dashboard";

  return (
    <AuthPageShell
      eyebrow="ClipStitchr access"
      title="Sign in to ClipStitchr."
      description="Manage Hook/UGC clips, product demos, avatar photos, Stitches, Swipes, and longer vertical exports."
    >
      <SignIn
        appearance={authComponentAppearance}
        fallbackRedirectUrl={planRedirectHref}
        forceRedirectUrl={selectedPlanKey ? planRedirectHref : undefined}
        path="/sign-in"
        routing="path"
        signUpFallbackRedirectUrl={planRedirectHref}
        signUpForceRedirectUrl={selectedPlanKey ? planRedirectHref : undefined}
        signUpUrl={
          selectedPlanKey ? getPlanSignupHref(selectedPlanKey) : "/sign-up"
        }
      />
    </AuthPageShell>
  );
}
