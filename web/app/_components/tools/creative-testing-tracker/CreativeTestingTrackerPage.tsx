import { CreativeTestingTrackerWorkspace } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingTrackerWorkspace";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { creativeTestingTrackerFaqs } from "@/lib/clipstitchr/tools/creativeTestingTracker/creativeTestingTrackerFaqs";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

const tool = publicToolCatalog["tiktok-reels-creative-testing-tracker"];

type CreativeTestingTrackerPageProps = {
  variant?: PublicToolGateVariant;
};

export function CreativeTestingTrackerPage({
  variant = "control",
}: CreativeTestingTrackerPageProps) {
  const hasFunctionalUnlock = hasPublicToolPortabilityArtifactFormat(
    tool.key,
    "csv",
  );

  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={creativeTestingTrackerFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <CreativeTestingTrackerWorkspace
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
        title="Track the creative inputs beside the outcome numbers."
        paragraphs={[
          "Name the hook, first visual, and call to action so a result can be traced back to a real creative choice. A number without the creative setup is difficult to turn into the next useful test.",
          "Use the downloaded file as a working note, not as platform attribution. This tracker does not know attribution windows, reporting delays, audiences, bids, or delivery settings.",
        ]}
      />
      <ResourceFaq faqs={creativeTestingTrackerFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
