import { ClipStitchrSavingsCalculator } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsCalculator";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { clipStitchrSavingsFaqs } from "@/lib/clipstitchr/tools/clipStitchrSavings/clipStitchrSavingsFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

const tool = publicToolCatalog["clipstitchr-savings-report"];

export function ClipStitchrSavingsPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={clipStitchrSavingsFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <ClipStitchrSavingsCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey={tool.key}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        title="Compare the same costs on both sides."
        paragraphs={[
          "Source-footage spend and hourly cost stay shared so the comparison does not quietly remove a real expense. Current software is replaced by the exact selected ClipStitchr monthly price.",
          "Enter modeled output and editing time as assumptions you can defend. The result shows their arithmetic impact without claiming ClipStitchr will produce that outcome.",
        ]}
      />
      <ResourceFaq faqs={clipStitchrSavingsFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
