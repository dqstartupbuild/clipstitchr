import { PricingCreditRulesSection } from "@/app/_components/pricing/PricingCreditRulesSection";
import { PricingHero } from "@/app/_components/pricing/PricingHero";
import { PricingOfferStackSection } from "@/app/_components/pricing/PricingOfferStackSection";
import { PricingPlansSection } from "@/app/_components/pricing/PricingPlansSection";
import { PricingTopUpsSection } from "@/app/_components/pricing/PricingTopUpsSection";

export function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingOfferStackSection />
      <PricingPlansSection />
      <PricingCreditRulesSection />
      <PricingTopUpsSection />
    </>
  );
}
