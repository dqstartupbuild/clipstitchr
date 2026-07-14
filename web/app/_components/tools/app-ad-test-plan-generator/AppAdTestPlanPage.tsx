import { AppAdTestPlanFaq } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanFaq";
import { AppAdTestPlanGenerator } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanGenerator";
import { AppAdTestPlanGuide } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanGuide";
import { AppAdTestPlanHero } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdTestPlanDescription } from "@/lib/clipstitchr/tools/appAdTestPlan/appAdTestPlanDescription";
import { appAdTestPlanFaqs } from "@/lib/clipstitchr/tools/appAdTestPlan/appAdTestPlanFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppAdTestPlanPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={appAdTestPlanDescription}
        faqs={appAdTestPlanFaqs}
        name="App Ad Creative Test Plan Generator"
        pathname="/tools/app-ad-test-plan-generator"
      />
      <AppAdTestPlanHero />
      <AppAdTestPlanGenerator variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source="app-ad-test-plan-generator" />
          </div>
        </div>
      ) : null}
      <AppAdTestPlanGuide />
      <AppAdTestPlanFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-test-plan-generator" />
    </>
  );
}
