import { AdVariantCalculator } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculator";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { AdVariantCalculatorFaq } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorFaq";
import { AdVariantCalculatorGuide } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorGuide";
import { AdVariantCalculatorHero } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { adVariantCalculatorDescription } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorDescription";
import { adVariantCalculatorFaqs } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AdVariantCalculatorPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={adVariantCalculatorDescription}
        faqs={adVariantCalculatorFaqs}
        name="Ad Variant Calculator"
        pathname="/tools/ad-variant-calculator"
      />
      <AdVariantCalculatorHero />
      <AdVariantCalculator variant={variant} />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey="ad-variant-calculator"
            variant={variant}
          />
        </div>
      </div>
      <AdVariantCalculatorGuide />
      <AdVariantCalculatorFaq />
      <ToolDiscoveryLinks currentToolKey="ad-variant-calculator" />
    </>
  );
}
