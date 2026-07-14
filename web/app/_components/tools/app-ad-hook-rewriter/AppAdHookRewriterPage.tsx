import { AppAdHookRewriterClient } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterClient";
import { AppAdHookRewriterFaq } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterFaq";
import { AppAdHookRewriterGuide } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterGuide";
import { AppAdHookRewriterHero } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdHookRewriterDescription } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterDescription";
import { appAdHookRewriterFaqs } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterFaqs";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppAdHookRewriterPageProps = {
  variant?: PublicToolGateVariant;
};

export function AppAdHookRewriterPage({
  variant = "control",
}: AppAdHookRewriterPageProps) {
  return (
    <>
      <ToolStructuredData
        description={appAdHookRewriterDescription}
        faqs={appAdHookRewriterFaqs}
        name="App Ad Hook Rewrite Tool"
        pathname="/tools/app-ad-hook-rewriter"
      />
      <AppAdHookRewriterHero />
      <AppAdHookRewriterClient variant={variant} />
      {variant === "control" ? (
        <div className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <ToolLeadCaptureForm source="app-ad-hook-rewriter" />
          </div>
        </div>
      ) : null}
      <AppAdHookRewriterGuide />
      <AppAdHookRewriterFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-hook-rewriter" />
    </>
  );
}
