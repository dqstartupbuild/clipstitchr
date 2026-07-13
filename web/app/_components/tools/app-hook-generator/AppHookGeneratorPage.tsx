import { AppHookGeneratorClient } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorClient";
import { AppHookGeneratorFaq } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorFaq";
import { AppHookGeneratorGuide } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorGuide";
import { AppHookGeneratorHero } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appHookGeneratorDescription } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorDescription";
import { appHookGeneratorFaqs } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorFaqs";

export function AppHookGeneratorPage() {
  return (
    <>
      <ToolStructuredData
        description={appHookGeneratorDescription}
        faqs={appHookGeneratorFaqs}
        name="App Hook Generator"
        pathname="/tools/app-hook-generator"
      />
      <AppHookGeneratorHero />
      <AppHookGeneratorClient />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-hook-generator" />
        </div>
      </div>
      <AppHookGeneratorGuide />
      <AppHookGeneratorFaq />
      <ToolDiscoveryLinks currentToolKey="app-hook-generator" />
    </>
  );
}
