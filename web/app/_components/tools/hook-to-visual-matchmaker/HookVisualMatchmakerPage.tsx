import { HookVisualMatchmakerClient } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerClient";
import { HookVisualMatchmakerFaq } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerFaq";
import { HookVisualMatchmakerGuide } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerGuide";
import { HookVisualMatchmakerHero } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerHero";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { hookVisualMatchmakerDescription } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualMatchmakerDescription";
import { hookVisualMatchmakerFaqs } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualMatchmakerFaqs";

export function HookVisualMatchmakerPage() {
  return (
    <>
      <ToolStructuredData
        description={hookVisualMatchmakerDescription}
        faqs={hookVisualMatchmakerFaqs}
        name="Hook-to-Visual Matchmaker for App Ads"
        pathname="/tools/hook-to-visual-matchmaker"
      />
      <HookVisualMatchmakerHero />
      <HookVisualMatchmakerClient />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <ToolLeadCaptureForm source="hook-to-visual-matchmaker" />
        </div>
      </div>
      <HookVisualMatchmakerGuide />
      <HookVisualMatchmakerFaq />
      <ToolDiscoveryLinks currentToolKey="hook-to-visual-matchmaker" />
    </>
  );
}
