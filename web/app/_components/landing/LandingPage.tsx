import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import { LandingBottomBand } from "@/app/_components/landing/LandingBottomBand";
import { LandingFeatureGrid } from "@/app/_components/landing/LandingFeatureGrid";
import { LandingHero } from "@/app/_components/landing/LandingHero";
import { LandingPreview } from "@/app/_components/landing/LandingPreview";
import { LandingStudioSection } from "@/app/_components/landing/LandingStudioSection";
import { LandingWorkflow } from "@/app/_components/landing/LandingWorkflow";

export function LandingPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="landing" />
      <LandingHero />
      <LandingPreview />
      <LandingStudioSection />
      <LandingFeatureGrid />
      <LandingWorkflow />
      <LandingBottomBand />
      <SiteFooter />
    </div>
  );
}
