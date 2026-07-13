import { AppAdTestingBudgetPlanner } from "@/app/_components/tools/app-ad-testing-budget-planner/AppAdTestingBudgetPlanner";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdTestingBudgetFaqs } from "@/lib/clipstitchr/tools/appAdTestingBudget/appAdTestingBudgetFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

const tool = publicToolCatalog["app-ad-testing-budget-planner"];

export function AppAdTestingBudgetPage() {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={appAdTestingBudgetFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <AppAdTestingBudgetPlanner />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source={tool.key} />
        </div>
      </div>
      <ResourceGuide
        title="Keep production, media, and backlog separate."
        paragraphs={[
          "Set the production and reserve shares first. The remaining percentage becomes the active media allocation, so the full budget always stays visible.",
          "The evidence floor is your team's rule. Comparing it with an even cell split can reveal an overfilled plan, but it cannot tell you what a platform needs.",
        ]}
      />
      <ResourceFaq faqs={appAdTestingBudgetFaqs} />
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
