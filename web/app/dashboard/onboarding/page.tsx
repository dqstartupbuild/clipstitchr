import type { Metadata } from "next";
import { OnboardingPageClient } from "@/app/dashboard/onboarding/OnboardingPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `First Batch Setup | ${site.name}`,
  description:
    "Set up a product, upload UGC and demo clips, and create your first ClipStitchr batch.",
  canonical: "/dashboard/onboarding",
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
