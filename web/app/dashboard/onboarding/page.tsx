import type { Metadata } from "next";
import { OnboardingPageClient } from "@/app/dashboard/onboarding/OnboardingPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `First Ads Setup | ${site.name}`,
  description:
    "Set up a product, upload UGC and demo clips, review the scores, and make your first ClipStitchr ads without starting in an editor.",
  canonical: "/dashboard/onboarding",
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
