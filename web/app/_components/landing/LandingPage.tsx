import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import { LandingAutomationSection } from "@/app/_components/landing/LandingAutomationSection";
import { LandingBottomBand } from "@/app/_components/landing/LandingBottomBand";
import { LandingHero } from "@/app/_components/landing/LandingHero";
import { LandingHookLabSection } from "@/app/_components/landing/LandingHookLabSection";
import { LandingOfferStackSection } from "@/app/_components/landing/LandingOfferStackSection";
import { LandingPreview } from "@/app/_components/landing/LandingPreview";
import { LandingScoreSection } from "@/app/_components/landing/LandingScoreSection";
import { LandingExampleOutputSection } from "@/app/_components/landing/LandingExampleOutputSection";
import { LandingStudioSection } from "@/app/_components/landing/LandingStudioSection";
import { LandingSwiprSection } from "@/app/_components/landing/LandingSwiprSection";
import { LandingTemplateSection } from "@/app/_components/landing/LandingTemplateSection";
import { LandingWorkflow } from "@/app/_components/landing/LandingWorkflow";

export function LandingPage() {
  return (
    <div className="marketing-shell min-h-full bg-background text-foreground">
      <SiteHeader variant="landing" />
      <LandingHero />
      <LandingExampleOutputSection />
      <LandingWorkflow />
      <LandingOfferStackSection />
      <LandingHookLabSection />
      <LandingPreview />
      <LandingScoreSection />
      <LandingTemplateSection />
      <LandingStudioSection />
      <LandingSwiprSection />
      <LandingAutomationSection />
      <LandingBottomBand />
      <SiteFooter />
    </div>
  );
}
