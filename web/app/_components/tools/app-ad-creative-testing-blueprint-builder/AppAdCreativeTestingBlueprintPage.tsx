import { AppAdCreativeTestingBlueprintBuilder } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintBuilder";
import { AppAdCreativeTestingBlueprintFaq } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintFaq";
import { AppAdCreativeTestingBlueprintGuide } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintGuide";
import { AppAdCreativeTestingBlueprintHero } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdCreativeTestingBlueprintDescription } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintDescription";
import { appAdCreativeTestingBlueprintFaqs } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintFaqs";

export function AppAdCreativeTestingBlueprintPage() {
  return (
    <>
      <ToolStructuredData
        description={appAdCreativeTestingBlueprintDescription}
        faqs={appAdCreativeTestingBlueprintFaqs}
        name="App Ad Creative Testing Blueprint Builder"
        pathname="/tools/app-ad-creative-testing-blueprint-builder"
      />
      <AppAdCreativeTestingBlueprintHero />
      <AppAdCreativeTestingBlueprintBuilder />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-creative-testing-blueprint-builder" />
        </div>
      </div>
      <AppAdCreativeTestingBlueprintGuide />
      <AppAdCreativeTestingBlueprintFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-creative-testing-blueprint-builder" />
    </>
  );
}
