import { GuidedResourceWorkspace } from "@/app/_components/tools/resources/GuidedResourceWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

type GuidedResourcePageProps = {
  definition: GuidedResourceDefinition;
};

export function GuidedResourcePage({ definition }: GuidedResourcePageProps) {
  const resource = publicToolCatalog[definition.resourceKey];

  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={definition.faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero
        estimatedMinutes={definition.estimatedMinutes}
        resourceKey={definition.resourceKey}
      />
      <GuidedResourceWorkspace definition={definition} />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={definition.resourceKey} />
        </div>
      </div>
      <ResourceGuide
        paragraphs={definition.guideParagraphs}
        title={definition.guideTitle}
      />
      <ResourceFaq faqs={definition.faqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={definition.resourceKey} />
    </>
  );
}
