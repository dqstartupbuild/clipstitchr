import { AppUgcCostCalculator } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculator";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { AppUgcCostCalculatorFaq } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorFaq";
import { AppUgcCostCalculatorGuide } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorGuide";
import { AppUgcCostCalculatorHero } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appUgcCostDescription } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostDescription";
import { appUgcCostFaqs } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppUgcCostCalculatorPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={appUgcCostDescription}
        faqs={appUgcCostFaqs}
        name="App UGC Production Cost Calculator"
        pathname="/tools/app-ugc-cost-calculator"
      />
      <AppUgcCostCalculatorHero />
      <AppUgcCostCalculator variant={variant} />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey="app-ugc-cost-calculator"
            variant={variant}
          />
        </div>
      </div>
      <AppUgcCostCalculatorGuide />
      <AppUgcCostCalculatorFaq />
      <ToolDiscoveryLinks currentToolKey="app-ugc-cost-calculator" />
    </>
  );
}
