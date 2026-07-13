import { AppAdHookRewriterClient } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterClient";
import { AppAdHookRewriterFaq } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterFaq";
import { AppAdHookRewriterGuide } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterGuide";
import { AppAdHookRewriterHero } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appAdHookRewriterDescription } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterDescription";
import { appAdHookRewriterFaqs } from "@/lib/clipstitchr/tools/appAdHookRewriter/appAdHookRewriterFaqs";

export function AppAdHookRewriterPage() {
  return (
    <>
      <ToolStructuredData
        description={appAdHookRewriterDescription}
        faqs={appAdHookRewriterFaqs}
        name="App Ad Hook Rewrite Tool"
        pathname="/tools/app-ad-hook-rewriter"
      />
      <AppAdHookRewriterHero />
      <AppAdHookRewriterClient />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="app-ad-hook-rewriter" />
        </div>
      </div>
      <AppAdHookRewriterGuide />
      <AppAdHookRewriterFaq />
      <ToolDiscoveryLinks currentToolKey="app-ad-hook-rewriter" />
    </>
  );
}
