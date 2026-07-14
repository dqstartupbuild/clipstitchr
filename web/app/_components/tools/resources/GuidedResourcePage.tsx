import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { GuidedResourceWorkspace } from "@/app/_components/tools/resources/GuidedResourceWorkspace";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { hasPublicToolPortabilityArtifactFormat } from "@/lib/clipstitchr/tools/catalog/hasPublicToolPortabilityArtifactFormat";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

type GuidedResourcePageProps = {
  definition: GuidedResourceDefinition;
  hasBrowserRecognition?: boolean;
  isEmailNativeEnrolled?: boolean;
  isEmailProviderReady?: boolean;
  variant?: PublicToolGateVariant;
};

export function GuidedResourcePage({
  definition,
  hasBrowserRecognition = false,
  isEmailNativeEnrolled = false,
  isEmailProviderReady,
  variant = "control",
}: GuidedResourcePageProps) {
  const resource = publicToolCatalog[definition.resourceKey];
  const gateMetadata = getPublicToolGateMetadata(definition.resourceKey);
  const hasFunctionalPortabilityUnlock =
    hasPublicToolPortabilityArtifactFormat(
      definition.resourceKey,
      "markdown",
    ) ||
    hasPublicToolPortabilityArtifactFormat(definition.resourceKey, "print");
  const isEmailNativeGateActive =
    gateMetadata.mode === "email-native" &&
    variant === "hybrid-v1" &&
    isEmailProviderReady === true;

  return (
    <>
      <ToolStructuredData
        description={resource.description}
        faqs={definition.faqs}
        name={resource.name}
        pathname={resource.pathname}
      />
      <ResourceHero
        estimatedMinutes={definition.estimatedMinutes}
        resourceKey={definition.resourceKey}
      />
      <GuidedResourceWorkspace
        definition={definition}
        isEmailNativeEnrolled={isEmailNativeEnrolled}
        isEmailNativeGateActive={isEmailNativeGateActive}
        variant={variant}
      />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={
              isEmailNativeGateActive || hasFunctionalPortabilityUnlock
            }
            hasBrowserRecognition={hasBrowserRecognition}
            isEmailProviderReady={isEmailProviderReady}
            isResultDisplayed
            toolKey={definition.resourceKey}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        paragraphs={definition.guideParagraphs}
        title={definition.guideTitle}
      />
      <ResourceFaq faqs={definition.faqs} />
      <ResourcePricingCta
        toolKey={definition.resourceKey}
        variant={variant}
      />
      <ToolDiscoveryLinks currentToolKey={definition.resourceKey} />
    </>
  );
}
