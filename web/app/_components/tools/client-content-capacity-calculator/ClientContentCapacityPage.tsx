import { ClientContentCapacityCalculator } from "@/app/_components/tools/client-content-capacity-calculator/ClientContentCapacityCalculator";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { clientContentCapacityFaqs } from "@/lib/clipstitchr/tools/clientContentCapacity/clientContentCapacityFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["client-content-capacity-calculator"];

export function ClientContentCapacityPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={clientContentCapacityFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <ClientContentCapacityCalculator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Find the constraint before adding more client work."
        paragraphs={[
          "Estimate available hours and effort separately for capture, editing, and review. The lowest output becomes the workflow ceiling instead of averaging bottlenecks away.",
          "Productive-time percentage applies the same meeting and admin adjustment to every stage. Use observed team data when possible, then revisit the model as the workflow changes.",
        ]}
      />
      <ResourceFaq faqs={clientContentCapacityFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
