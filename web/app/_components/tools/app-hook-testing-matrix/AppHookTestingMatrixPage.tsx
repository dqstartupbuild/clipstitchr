import { AppHookTestingMatrixWorkspace } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixWorkspace";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { appHookTestingMatrixFaqs } from "@/lib/clipstitchr/tools/appHookTestingMatrix/appHookTestingMatrixFaqs";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

const tool = publicToolCatalog["app-hook-testing-matrix"];

type AppHookTestingMatrixPageProps = {
  variant?: PublicToolGateVariant;
};

export function AppHookTestingMatrixPage({
  variant = "control",
}: AppHookTestingMatrixPageProps) {
  const hasFunctionalUnlock = hasPublicToolPortabilityArtifactFormat(
    tool.key,
    "csv",
  );

  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={appHookTestingMatrixFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} estimatedMinutes={4} />
      <AppHookTestingMatrixWorkspace variant={variant} />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={hasFunctionalUnlock}
            toolKey={tool.key}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        title="Compare hooks before opening a second variable."
        paragraphs={[
          "The first cell is your control. Every Stage 1 challenger keeps its visual and CTA fixed while changing only the hook.",
          "Stage 2 deliberately waits for a selected hook, then changes only the visual. The matrix is capped so the plan stays understandable rather than becoming every possible combination.",
        ]}
      />
      <ResourceFaq faqs={appHookTestingMatrixFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
