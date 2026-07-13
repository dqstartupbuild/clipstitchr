import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ShortFormVideoSpecsBrowser } from "@/app/_components/tools/short-form-video-specs/ShortFormVideoSpecsBrowser";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const resource = publicToolCatalog["short-form-video-specs-cheat-sheet"];
const faqs = [
  {
    question: "Why do some fields say the value is not stated?",
    answer:
      "Because platform pages often publish only the facts relevant to that page. This reference leaves an explicit gap instead of borrowing a number from an unrelated placement or presenting a guess as a rule.",
  },
  {
    question: "Does matching a record guarantee platform approval?",
    answer:
      "No. Specifications, account options, policies, placements, and interfaces change. Check the linked source and the platform's final upload or ad preview before publishing.",
  },
  {
    question: "Does this tool inspect or fix my video?",
    answer:
      "No. It is a filterable reference. It does not read a file, certify compliance, normalize dimensions, compress video, or create an ad.",
  },
];

export function ShortFormVideoSpecsPage() {
  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero resourceKey={resource.key} />
      <ShortFormVideoSpecsBrowser />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={resource.key} />
        </div>
      </div>
      <ResourceGuide
        paragraphs={[
          "Start with the record that matches both your platform and your publishing path. An organic Reel, a boosted Reel, a TikTok reservation ad, and a YouTube Demand Gen asset can have different rules even when all four appear vertical.",
          "Use the ratio, dimensions, duration, container, codec, frame-rate, audio, and file-limit fields as a recording and handoff checklist. A field marked not stated is a cue to check the platform's live uploader or a more specific official placement page.",
          "Every record links to its first-party source and shows the date it was checked. Recheck that source before a high-stakes launch because this page is a working reference, not permanent platform certification.",
        ]}
        title="Match the publishing path before you match the numbers."
      />
      <ResourceFaq faqs={faqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={resource.key} />
    </>
  );
}
