import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ThirtyDayContentPlanWorkspace } from "@/app/_components/tools/thirty-day-content-plan/ThirtyDayContentPlanWorkspace";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { thirtyDayContentPlanFaqs } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/thirtyDayContentPlanFaqs";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

const tool = publicToolCatalog["30-day-app-content-plan"];

type ThirtyDayContentPlanPageProps = {
  variant?: PublicToolGateVariant;
};

export function ThirtyDayContentPlanPage({
  variant = "control",
}: ThirtyDayContentPlanPageProps) {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={thirtyDayContentPlanFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={5} />
      <ThirtyDayContentPlanWorkspace variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source={tool.key} />
          </div>
        </div>
      ) : null}
      <ResourceGuide
        title="Plan the work between posts, not just the posting dates."
        paragraphs={[
          "Choose a pace you can maintain and be honest about the source footage you already have. The plan rotates those real assets instead of assuming every day starts from scratch.",
          "Production, repurposing, and review days are part of the result. Download the plan, then refine the wording and claims before anything is published.",
        ]}
      />
      <ResourceFaq faqs={thirtyDayContentPlanFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
