import { AdVariantCalculator } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculator";
import { AdVariantCalculatorFaq } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorFaq";
import { AdVariantCalculatorGuide } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorGuide";
import { AdVariantCalculatorHero } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { adVariantCalculatorDescription } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorDescription";
import { adVariantCalculatorFaqs } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorFaqs";

export function AdVariantCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        description={adVariantCalculatorDescription}
        faqs={adVariantCalculatorFaqs}
        name="Ad Variant Calculator"
        pathname="/tools/ad-variant-calculator"
      />
      <AdVariantCalculatorHero />
      <AdVariantCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="ad-variant-calculator" />
        </div>
      </div>
      <AdVariantCalculatorGuide />
      <AdVariantCalculatorFaq />
      <ToolDiscoveryLinks currentToolKey="ad-variant-calculator" />
    </>
  );
}
