import type { Metadata } from "next";
import { OnboardingPageClient } from "@/app/dashboard/onboarding/OnboardingPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `First Ads Setup | ${site.name}`,
  description:
    "Set up a product, upload Hook/UGC and demo clips, review the scores, and make your first ClipStitchr ads.",
  canonical: "/dashboard/onboarding",
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
