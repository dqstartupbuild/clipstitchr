import { AppAdShotListFaq } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListFaq";
import { AppAdShotListGenerator } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListGenerator";
import { AppAdShotListGuide } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListGuide";
import { AppAdShotListHero } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdShotListDescription } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListDescription";
import { appAdShotListFaqs } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListFaqs";

export function AppAdShotListPage() {
  return (
    <>
      <ToolStructuredData
        description={appAdShotListDescription}
        faqs={appAdShotListFaqs}
        name="App Ad Shot List Generator"
        pathname="/tools/app-ad-shot-list-generator"
      />
      <AppAdShotListHero />
      <AppAdShotListGenerator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-shot-list-generator" />
        </div>
      </div>
      <AppAdShotListGuide />
      <AppAdShotListFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-shot-list-generator" />
    </>
  );
}
