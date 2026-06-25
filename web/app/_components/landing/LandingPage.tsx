import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import { LandingBeforeAfter } from "@/app/_components/landing/LandingBeforeAfter";
import { LandingChallengeTeaser } from "@/app/_components/landing/LandingChallengeTeaser";
import { LandingExamples } from "@/app/_components/landing/LandingExamples";
import { LandingFinalCta } from "@/app/_components/landing/LandingFinalCta";
import { LandingHero } from "@/app/_components/landing/LandingHero";
import { LandingLibraryThin } from "@/app/_components/landing/LandingLibraryThin";
import { LandingProductShowcase } from "@/app/_components/landing/LandingProductShowcase";
import { LandingProofStrip } from "@/app/_components/landing/LandingProofStrip";
import { LandingWorkflow } from "@/app/_components/landing/LandingWorkflow";

const guppyMetrics = [
  { label: "Total views", value: "161K+" },
  { label: "Organic views", value: "58K+" },
  { label: "Reels published", value: "75" },
  { label: "Customers", value: "48" },
];

export function LandingPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="landing" />
      <LandingHero />
      <LandingProofStrip
        metrics={guppyMetrics}
        caseStudyHref="/case-studies/fitness-app-growth-case-study-guppy"
        caseStudyLabel="Read the case study"
      />
      <LandingBeforeAfter />
      <LandingWorkflow />
      <LandingProductShowcase />
      <LandingLibraryThin />
      <LandingExamples />
      <LandingChallengeTeaser />
      <LandingFinalCta />
      <SiteFooter />
    </div>
  );
}