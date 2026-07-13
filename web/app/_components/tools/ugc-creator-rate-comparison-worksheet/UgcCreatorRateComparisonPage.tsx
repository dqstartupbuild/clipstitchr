import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { UgcCreatorRateComparisonWorksheet } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorRateComparisonWorksheet";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { ugcCreatorRateComparisonFaqs } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/ugcCreatorRateComparisonFaqs";

const tool = publicToolCatalog["ugc-creator-rate-comparison-worksheet"];

export function UgcCreatorRateComparisonPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={ugcCreatorRateComparisonFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <UgcCreatorRateComparisonWorksheet />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Normalize the numbers, then compare the actual scope."
        paragraphs={[
          "Enter base price and required add-ons separately so every displayed total can be traced back to the quote. Add your own estimate of usable source clips only when you can apply it consistently.",
          "The median is calculated from this entered set alone. Review raw-footage delivery, revisions, usage terms, deadlines, and creative fit before making a decision.",
        ]}
      />
      <ResourceFaq faqs={ugcCreatorRateComparisonFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
