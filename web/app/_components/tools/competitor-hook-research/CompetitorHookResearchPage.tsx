import { CompetitorHookResearchWorkspace } from "@/app/_components/tools/competitor-hook-research/CompetitorHookResearchWorkspace";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { competitorHookResearchFaqs } from "@/lib/clipstitchr/tools/competitorHookResearch/competitorHookResearchFaqs";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

const tool = publicToolCatalog["competitor-hook-research-worksheet"];

type CompetitorHookResearchPageProps = {
  variant?: PublicToolGateVariant;
};

export function CompetitorHookResearchPage({
  variant = "control",
}: CompetitorHookResearchPageProps) {
  const hasFunctionalUnlock = hasPublicToolPortabilityArtifactFormat(
    tool.key,
    "markdown",
  );

  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={competitorHookResearchFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={10} />
      <CompetitorHookResearchWorkspace
        hasFunctionalUnlock={hasFunctionalUnlock}
        variant={variant}
      />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={hasFunctionalUnlock}
            toolKey={tool.key}
            variant={variant}
          />
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
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
