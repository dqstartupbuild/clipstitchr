import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { CollectionResourceBrowser } from "@/app/_components/tools/resources/CollectionResourceBrowser";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";

type CollectionResourcePageProps = {
  definition: CollectionResourceDefinition;
  variant?: PublicToolGateVariant;
};

export function CollectionResourcePage({
  definition,
  variant = "control",
}: CollectionResourcePageProps) {
  const resource = publicToolCatalog[definition.resourceKey];
  const hasFunctionalUnlock =
    hasPublicToolPortabilityArtifactFormat(definition.resourceKey, "csv") ||
    hasPublicToolPortabilityArtifactFormat(
      definition.resourceKey,
      "markdown",
    ) ||
    hasPublicToolPortabilityArtifactFormat(definition.resourceKey, "print");

  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={definition.faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero resourceKey={definition.resourceKey} />
      <CollectionResourceBrowser
        definition={definition}
        variant={variant}
      />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={hasFunctionalUnlock}
            isResultDisplayed
            toolKey={definition.resourceKey}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        paragraphs={definition.guideParagraphs}
        title={definition.guideTitle}
      />
      <ResourceFaq faqs={definition.faqs} />
      <ResourcePricingCta
        toolKey={definition.resourceKey}
        variant={variant}
      />
      <ToolDiscoveryLinks currentToolKey={definition.resourceKey} />
    </>
  );
}
