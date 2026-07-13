import { AppAdHookGraderClient } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderClient";
import { AppAdHookGraderFaq } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderFaq";
import { AppAdHookGraderGuide } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderGuide";
import { AppAdHookGraderHero } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdHookGraderDescription } from "@/lib/clipstitchr/tools/appAdHookGrader/appAdHookGraderDescription";
import { appAdHookGraderFaqs } from "@/lib/clipstitchr/tools/appAdHookGrader/appAdHookGraderFaqs";

export function AppAdHookGraderPage() {
  return (
    <>
      <ToolStructuredData
        description={appAdHookGraderDescription}
        faqs={appAdHookGraderFaqs}
        name="Hook Strength Grader for App Ads"
        pathname="/tools/app-ad-hook-grader"
      />
      <AppAdHookGraderHero />
      <AppAdHookGraderClient />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-hook-grader" />
        </div>
      </div>
      <AppAdHookGraderGuide />
      <AppAdHookGraderFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-hook-grader" />
    </>
  );
}
