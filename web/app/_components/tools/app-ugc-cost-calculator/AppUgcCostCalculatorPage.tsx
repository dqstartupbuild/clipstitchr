import { AppUgcCostCalculator } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculator";
import { AppUgcCostCalculatorFaq } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorFaq";
import { AppUgcCostCalculatorGuide } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorGuide";
import { AppUgcCostCalculatorHero } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appUgcCostDescription } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostDescription";
import { appUgcCostFaqs } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostFaqs";

export function AppUgcCostCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        description={appUgcCostDescription}
        faqs={appUgcCostFaqs}
        name="App UGC Production Cost Calculator"
        pathname="/tools/app-ugc-cost-calculator"
      />
      <AppUgcCostCalculatorHero />
      <AppUgcCostCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ugc-cost-calculator" />
        </div>
      </div>
      <AppUgcCostCalculatorGuide />
      <AppUgcCostCalculatorFaq />
      <ToolDiscoveryLinks currentToolKey="app-ugc-cost-calculator" />
    </>
  );
}
