import { AppAdTestingBudgetPlanner } from "@/app/_components/tools/app-ad-testing-budget-planner/AppAdTestingBudgetPlanner";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdTestingBudgetFaqs } from "@/lib/clipstitchr/tools/appAdTestingBudget/appAdTestingBudgetFaqs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

const tool = publicToolCatalog["app-ad-testing-budget-planner"];

export function AppAdTestingBudgetPage({
  variant = "control",
}: PublicToolPageGateProps) {
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
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey={tool.key}
            variant={variant}
          />
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
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
