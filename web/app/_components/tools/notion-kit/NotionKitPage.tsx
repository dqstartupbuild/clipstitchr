import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { NotionKitWorkspace } from "@/app/_components/tools/notion-kit/NotionKitWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

const resource = publicToolCatalog["short-form-content-system-notion-kit"];
const faqs = [
  {
    question: "Is this a one-click Notion duplicate link?",
    answer:
      "No. It is a Notion-ready kit of five valid CSV files. Import each file, set the suggested property types, and add optional relations after import.",
  },
  {
    question: "Does ClipStitchr sync changes from these tables?",
    answer:
      "No. The files are planning templates. They do not connect to Notion, publish posts, store media, or synchronize with a ClipStitchr account.",
  },
];

type NotionKitPageProps = {
  variant?: PublicToolGateVariant;
};

export function NotionKitPage({ variant = "control" }: NotionKitPageProps) {
  const hasFunctionalUnlock = hasPublicToolPortabilityArtifactFormat(
    resource.key,
    "csv",
  );

  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero resourceKey={resource.key} />
      <NotionKitWorkspace
        hasFunctionalUnlock={hasFunctionalUnlock}
        variant={variant}
      />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={hasFunctionalUnlock}
            toolKey={resource.key}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        paragraphs={[
          "Import each CSV as its own database. The IDs make it possible to relate ideas, shoots, assets, posts, and results without requiring a paid integration.",
          "The example rows demonstrate how information moves through the system. Replace them with your own facts, keep unknown results blank, and do not treat a rights-status column as legal verification.",
          "This kit is intentionally planning-only. ClipStitchr becomes useful when the source footage is ready to organize and turn into finished ads.",
        ]}
        title="Set up the tables in a practical order."
      />
      <ResourceFaq faqs={faqs} />
      <ResourcePricingCta toolKey={resource.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={resource.key} />
    </>
  );
}
