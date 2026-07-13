import { CompetitorHookResearchWorkspace } from "@/app/_components/tools/competitor-hook-research/CompetitorHookResearchWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { competitorHookResearchFaqs } from "@/lib/clipstitchr/tools/competitorHookResearch/competitorHookResearchFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["competitor-hook-research-worksheet"];

export function CompetitorHookResearchPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={competitorHookResearchFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={10} />
      <CompetitorHookResearchWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Study the structure without copying the creative."
        paragraphs={[
          "Write down exact opening words, visuals, handoffs, and visible proof first. Add your audience and intent interpretations only in the fields clearly labeled as inference.",
          "Repeated tags are counts across your own entries, not performance claims. Use the final questions to design an original follow-up observation or test.",
        ]}
      />
      <ResourceFaq faqs={competitorHookResearchFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
