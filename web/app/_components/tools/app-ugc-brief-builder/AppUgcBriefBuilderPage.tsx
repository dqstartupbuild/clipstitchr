import { AppUgcBriefBuilder } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilder";
import { AppUgcBriefBuilderFaq } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderFaq";
import { AppUgcBriefBuilderGuide } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderGuide";
import { AppUgcBriefBuilderHero } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appUgcBriefDescription } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefDescription";
import { appUgcBriefFaqs } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppUgcBriefBuilderPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={appUgcBriefDescription}
        faqs={appUgcBriefFaqs}
        name="UGC Ad Brief Builder for Apps"
        pathname="/tools/app-ugc-brief-builder"
      />
      <AppUgcBriefBuilderHero />
      <AppUgcBriefBuilder variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source="app-ugc-brief-builder" />
          </div>
        </div>
      ) : null}
      <AppUgcBriefBuilderGuide />
      <AppUgcBriefBuilderFaq />
      <ToolDiscoveryLinks currentToolKey="app-ugc-brief-builder" />
    </>
  );
}
