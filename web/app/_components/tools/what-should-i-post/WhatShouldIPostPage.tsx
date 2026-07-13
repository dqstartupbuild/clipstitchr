import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { WhatShouldIPostWorkspace } from "@/app/_components/tools/what-should-i-post/WhatShouldIPostWorkspace";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { whatShouldIPostFaqs } from "@/lib/clipstitchr/tools/whatShouldIPost/whatShouldIPostFaqs";

const tool = publicToolCatalog["what-should-i-post-decision-tree"];

export function WhatShouldIPostPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={whatShouldIPostFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={2} />
      <WhatShouldIPostWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Make the next post fit the assets you already have."
        paragraphs={[
          "The recommendation starts with your goal and the viewer's current awareness, then checks what footage is actually available and how you prefer to appear.",
          "Use the prompts as directions, not finished copy. Keep claims honest, capture the listed source material, and use the linked next tool when you are ready to plan the production.",
        ]}
      />
      <ResourceFaq faqs={whatShouldIPostFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
