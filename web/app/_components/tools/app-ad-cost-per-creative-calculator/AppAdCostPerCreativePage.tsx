import { AppAdCostPerCreativeCalculator } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeCalculator";
import { AppAdCostPerCreativeFaq } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeFaq";
import { AppAdCostPerCreativeGuide } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeGuide";
import { AppAdCostPerCreativeHero } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdCostPerCreativeDescription } from "@/lib/clipstitchr/tools/appAdCostPerCreative/appAdCostPerCreativeDescription";
import { appAdCostPerCreativeFaqs } from "@/lib/clipstitchr/tools/appAdCostPerCreative/appAdCostPerCreativeFaqs";

export function AppAdCostPerCreativePage() {
  return (
    <>
      <ToolStructuredData
        description={appAdCostPerCreativeDescription}
        faqs={appAdCostPerCreativeFaqs}
        name="App Ad Cost per Creative Calculator"
        pathname="/tools/app-ad-cost-per-creative-calculator"
      />
      <AppAdCostPerCreativeHero />
      <AppAdCostPerCreativeCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-cost-per-creative-calculator" />
        </div>
      </div>
      <AppAdCostPerCreativeGuide />
      <AppAdCostPerCreativeFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-cost-per-creative-calculator" />
    </>
  );
}
