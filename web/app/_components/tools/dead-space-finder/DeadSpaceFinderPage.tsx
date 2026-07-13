import { DeadSpaceFinderTool } from "@/app/_components/tools/dead-space-finder/DeadSpaceFinderTool";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const resource = publicToolCatalog["app-ad-dead-space-finder"];
const faqs = [
  {
    question: "Does the tool upload or edit my video?",
    answer:
      "No. Media Bunny decodes bounded samples in your browser. The file is not uploaded, trimmed, transformed, stored, or exported.",
  },
  {
    question: "Does every listed span need to be removed?",
    answer:
      "No. The tool finds low-motion, low-audio candidates. A pause may be intentional, audio can be quiet, and the final decision requires watching the local preview.",
  },
  {
    question: "Why is analysis limited to three minutes and 200 MB?",
    answer:
      "Decoded frame and audio work uses browser memory and processing time. The cap keeps this free local review bounded and matches its short-form purpose.",
  },
];

export function DeadSpaceFinderPage() {
  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero resourceKey={resource.key} />
      <DeadSpaceFinderTool />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={resource.key} />
        </div>
      </div>
      <ResourceGuide
        paragraphs={[
          "The analysis samples a 64-pixel-wide frame every half second and compares luminance with the previous sample. When decodable audio exists, it also calculates root-mean-square amplitude from a decoded audio sample.",
          "Consecutive points below both visitor-adjustable thresholds become review spans only after they meet the selected minimum duration. The result does not understand speech, story, intent, music, or whether a pause improves the ad.",
          "Watch every listed span in context. Keep intentional breathing room, and use ClipStitchr's paid workflow only when you are ready to work with the actual source clips.",
        ]}
        title="Use the timestamps as review prompts, not automatic cuts."
      />
      <ResourceFaq faqs={faqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={resource.key} />
    </>
  );
}
