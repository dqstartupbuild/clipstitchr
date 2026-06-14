import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import { LandingAutomationSection } from "@/app/_components/landing/LandingAutomationSection";
import { LandingBottomBand } from "@/app/_components/landing/LandingBottomBand";
import { LandingFeatureGrid } from "@/app/_components/landing/LandingFeatureGrid";
import { LandingHero } from "@/app/_components/landing/LandingHero";
import { LandingPreview } from "@/app/_components/landing/LandingPreview";
import { LandingScoreSection } from "@/app/_components/landing/LandingScoreSection";
import { LandingExampleOutputSection } from "@/app/_components/landing/LandingExampleOutputSection";
import { LandingStudioSection } from "@/app/_components/landing/LandingStudioSection";
import { LandingTemplateSection } from "@/app/_components/landing/LandingTemplateSection";
import { LandingWorkflow } from "@/app/_components/landing/LandingWorkflow";

export function LandingPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="landing" />
      <LandingHero />
      <LandingExampleOutputSection />
      <LandingScoreSection />
      <LandingPreview />
      <LandingStudioSection />
      <LandingTemplateSection />
      <LandingAutomationSection />
      <LandingFeatureGrid />
      <LandingWorkflow />
      <LandingBottomBand />
      <SiteFooter />
    </div>
  );
}
