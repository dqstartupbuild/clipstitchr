import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { TikTokSafeZoneTool } from "@/app/_components/tools/tiktok-safe-zone/TikTokSafeZoneTool";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const resource = publicToolCatalog["tiktok-safe-zone-overlay"];
const faqs = [
  {
    question: "Is this TikTok's official safe-zone template?",
    answer:
      "No. It is a clearly versioned, conservative planning overlay based on the interface areas TikTok tells advertisers to protect. TikTok says the exact safe area changes with dimensions, caption length, and interactive add-ons, so use TikTok's own preview before launch.",
  },
  {
    question: "Does the image leave my browser?",
    answer:
      "No. The page creates a temporary browser object URL for the local preview. It does not upload, store, analyze, or send the image to ClipStitchr.",
  },
  {
    question: "Can I download an edited frame?",
    answer:
      "No. The draggable box is only a placement test. The tool does not burn in text, edit your frame, create a certified template, or export a new image.",
  },
];

export function TikTokSafeZonePage() {
  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero resourceKey={resource.key} />
      <TikTokSafeZoneTool />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={resource.key} />
        </div>
      </div>
      <ResourceGuide
        paragraphs={[
          "Add a 9:16 screenshot or exported frame, then drag the sample text where you plan to place your key message. A clear result means only that the box avoids this preset's conservative buffers.",
          "TikTok's current In-Feed documentation says key text and logos can be covered or cropped outside the safe zone. It also says the safe area varies with orientation, caption length, and interactive add-ons.",
          "Treat this as an early composition check. Before publishing, preview the finished creative in the exact TikTok placement, caption, language direction, and add-on setup you will use.",
        ]}
        title="Check placement early, then preview the real ad setup."
      />
      <ResourceFaq faqs={faqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={resource.key} />
    </>
  );
}
