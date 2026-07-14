import { AppUgcClipReadinessChecker } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessChecker";
import { AppUgcClipReadinessFaq } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessFaq";
import { AppUgcClipReadinessGuide } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessGuide";
import { AppUgcClipReadinessHero } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appUgcClipReadinessDescription } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipReadinessDescription";
import { appUgcClipReadinessFaqs } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipReadinessFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppUgcClipReadinessPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={appUgcClipReadinessDescription}
        faqs={appUgcClipReadinessFaqs}
        name="App UGC Clip Readiness Checker"
        pathname="/tools/app-ugc-clip-readiness-checker"
      />
      <AppUgcClipReadinessHero />
      <AppUgcClipReadinessChecker variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source="app-ugc-clip-readiness-checker" />
          </div>
        </div>
      ) : null}
      <AppUgcClipReadinessGuide />
      <AppUgcClipReadinessFaq />
      <ToolDiscoveryLinks currentToolKey="app-ugc-clip-readiness-checker" />
    </>
  );
}
