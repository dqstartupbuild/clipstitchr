import { ClipNamingSystemWorkspace } from "@/app/_components/tools/clip-naming-system-generator/ClipNamingSystemWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { clipNamingSystemFaqs } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingSystemFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["clip-naming-system-generator"];

export function ClipNamingSystemPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={clipNamingSystemFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <ClipNamingSystemWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Make filenames useful before a folder gets crowded."
        paragraphs={[
          "Fill in one real example, then move the details your team scans most often toward the front. The generator keeps every required token even when you reorder them.",
          "Copy the convention into creator handoffs and use the same separator across a campaign. The generated text is safe to copy, but your team still controls the actual files.",
        ]}
      />
      <ResourceFaq faqs={clipNamingSystemFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
