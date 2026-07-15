import { SiteHeader } from "@/app/site-header";
import { SiteFooter } from "@/app/site-footer";
import { LandingBottomBand } from "@/app/_components/landing/LandingBottomBand";
import { LandingHero } from "@/app/_components/landing/LandingHero";
import { LandingOfferStackSection } from "@/app/_components/landing/LandingOfferStackSection";
import { LandingExampleOutputSection } from "@/app/_components/landing/LandingExampleOutputSection";
import { LandingProofSection } from "@/app/_components/landing/LandingProofSection";
import { LandingWorkflow } from "@/app/_components/landing/LandingWorkflow";

export function LandingPage() {
  return (
    <div className="marketing-shell landing-shell min-h-full bg-background text-foreground">
      <SiteHeader variant="landing" />
      <LandingHero />
      <LandingExampleOutputSection />
      <LandingWorkflow />
      <LandingOfferStackSection />
      <LandingProofSection />
      <LandingBottomBand />
      <SiteFooter />
    </div>
  );
}
