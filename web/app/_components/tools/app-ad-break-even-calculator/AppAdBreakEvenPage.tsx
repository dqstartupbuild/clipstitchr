import { AppAdBreakEvenCalculator } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenCalculator";
import { AppAdBreakEvenFaq } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenFaq";
import { AppAdBreakEvenGuide } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenGuide";
import { AppAdBreakEvenHero } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdBreakEvenDescription } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenDescription";
import { appAdBreakEvenFaqs } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenFaqs";

export function AppAdBreakEvenPage() {
  return (
    <>
      <ToolStructuredData
        description={appAdBreakEvenDescription}
        faqs={appAdBreakEvenFaqs}
        name="App Ad Break-Even Calculator"
        pathname="/tools/app-ad-break-even-calculator"
      />
      <AppAdBreakEvenHero />
      <AppAdBreakEvenCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-break-even-calculator" />
        </div>
      </div>
      <AppAdBreakEvenGuide />
      <AppAdBreakEvenFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-break-even-calculator" />
    </>
  );
}
