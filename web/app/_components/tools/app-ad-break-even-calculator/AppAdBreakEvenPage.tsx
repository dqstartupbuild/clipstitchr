import { AppAdBreakEvenCalculator } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenCalculator";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { AppAdBreakEvenFaq } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenFaq";
import { AppAdBreakEvenGuide } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenGuide";
import { AppAdBreakEvenHero } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdBreakEvenDescription } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenDescription";
import { appAdBreakEvenFaqs } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppAdBreakEvenPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={appAdBreakEvenDescription}
        faqs={appAdBreakEvenFaqs}
        name="App Ad Break-Even Calculator"
        pathname="/tools/app-ad-break-even-calculator"
      />
      <AppAdBreakEvenHero />
      <AppAdBreakEvenCalculator variant={variant} />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey="app-ad-break-even-calculator"
            variant={variant}
          />
        </div>
      </div>
      <AppAdBreakEvenGuide />
      <AppAdBreakEvenFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-break-even-calculator" />
    </>
  );
}
