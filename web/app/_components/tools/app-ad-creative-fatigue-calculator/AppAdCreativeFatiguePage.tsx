import { AppAdCreativeFatigueCalculator } from "@/app/_components/tools/app-ad-creative-fatigue-calculator/AppAdCreativeFatigueCalculator";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdCreativeFatigueFaqs } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/appAdCreativeFatigueFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["app-ad-creative-fatigue-calculator"];

export function AppAdCreativeFatiguePage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={appAdCreativeFatigueFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <AppAdCreativeFatigueCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Use this as a delivery baseline, then check real reports."
        paragraphs={[
          "The model assumes daily impressions are spread evenly across the entered audience and active creatives. That makes every formula visible, but real platforms may concentrate delivery.",
          "Choose the frequency ceiling from your own evidence. Crossing it does not prove fatigue, and staying below it does not prove a creative is healthy.",
        ]}
      />
      <ResourceFaq faqs={appAdCreativeFatigueFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
