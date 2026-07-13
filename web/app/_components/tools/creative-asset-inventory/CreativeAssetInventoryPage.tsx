import { CreativeAssetInventoryWorkspace } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { creativeAssetInventoryFaqs } from "@/lib/clipstitchr/tools/creativeAssetInventory/creativeAssetInventoryFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["app-creative-asset-inventory-template"];

export function CreativeAssetInventoryPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={creativeAssetInventoryFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <CreativeAssetInventoryWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Count source material by production readiness, not just existence."
        paragraphs={[
          "A folder full of clips can still leave the next test blocked. Separate assets that are ready now from files that need work, known missing captures, and files with unclear usage details.",
          "Use the ranked actions to close source gaps before creating more finished ads. The worksheet is a session snapshot, so download it when the counts reflect your real inventory.",
        ]}
      />
      <ResourceFaq faqs={creativeAssetInventoryFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
