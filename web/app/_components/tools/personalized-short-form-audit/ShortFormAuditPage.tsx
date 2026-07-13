import { ShortFormAuditWorkspace } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { personalizedShortFormAuditFaqs } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/personalizedShortFormAuditFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["personalized-short-form-content-audit"];

export function ShortFormAuditPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={personalizedShortFormAuditFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <ShortFormAuditWorkspace />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Use the score to find the dependency, not to judge the team."
        paragraphs={[
          "The five dimensions make different bottlenecks visible. Weak testing may be the loudest problem, but missing source assets or an unclear payoff can still be the dependency that should be fixed first.",
          "The fourteen days follow that dependency order. Download the result, change any answer that was too generous, and use the plan as a short working sequence rather than a performance promise.",
        ]}
      />
      <ResourceFaq faqs={personalizedShortFormAuditFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
