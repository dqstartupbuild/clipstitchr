import { RawCampaignPlannerWorkspace } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignPlannerWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { rawClipsCampaignPlannerFaqs } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/rawClipsCampaignPlannerFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

const tool = publicToolCatalog["raw-clips-to-campaign-planner"];

export function RawCampaignPlannerPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={rawClipsCampaignPlannerFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <RawCampaignPlannerWorkspace variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source={tool.key} />
          </div>
        </div>
      ) : null}
      <ResourceGuide
        title="Plan from the footage you already have before asking for more."
        paragraphs={[
          "Name each usable raw piece and give it a clear role. Add a few honest tags such as audience, angle, or payoff so the planner can show which pieces naturally belong together.",
          "Review the missing-capture list and reuse map before production. Copy the Markdown handoff when the inventory matches reality, because nothing is saved after the session.",
        ]}
      />
      <ResourceFaq faqs={rawClipsCampaignPlannerFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
