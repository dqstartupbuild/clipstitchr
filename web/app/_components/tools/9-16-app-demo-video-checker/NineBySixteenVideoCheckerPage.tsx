import { NineBySixteenVideoChecker } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoChecker";
import { NineBySixteenVideoCheckerFaq } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerFaq";
import { NineBySixteenVideoCheckerGuide } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerGuide";
import { NineBySixteenVideoCheckerHero } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { nineBySixteenVideoCheckerDescription } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/nineBySixteenVideoCheckerDescription";
import { nineBySixteenVideoCheckerFaqs } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/nineBySixteenVideoCheckerFaqs";

export function NineBySixteenVideoCheckerPage() {
  return (
    <>
      <ToolStructuredData
        description={nineBySixteenVideoCheckerDescription}
        faqs={nineBySixteenVideoCheckerFaqs}
        name="9:16 App Demo Video Checker"
        pathname="/tools/9-16-app-demo-video-checker"
      />
      <NineBySixteenVideoCheckerHero />
      <NineBySixteenVideoChecker />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="9-16-app-demo-video-checker" />
        </div>
      </div>
      <NineBySixteenVideoCheckerGuide />
      <NineBySixteenVideoCheckerFaq />
      <ToolDiscoveryLinks currentToolKey="9-16-app-demo-video-checker" />
    </>
  );
}
