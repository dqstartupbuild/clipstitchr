import { VideoCompressionEstimator } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionEstimator";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { videoCompressionEstimatorFaqs } from "@/lib/clipstitchr/tools/videoCompressionEstimator/videoCompressionEstimatorFaqs";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

const tool = publicToolCatalog["app-video-compression-estimator"];

export function VideoCompressionEstimatorPage({
  variant = "control",
}: PublicToolPageGateProps) {
  return (
    <>
      <ToolStructuredData
        description={tool.description}
        faqs={videoCompressionEstimatorFaqs}
        name={tool.name}
        pathname={tool.pathname}
      />
      <ResourceHero resourceKey={tool.key} />
      <VideoCompressionEstimator />
      <div className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <PublicToolGateCapture
            hasFunctionalUnlock={false}
            toolKey={tool.key}
            variant={variant}
          />
        </div>
      </div>
      <ResourceGuide
        title="Compare encoding scenarios without changing your file."
        paragraphs={[
          "Select a local video when you want its duration and original size filled in, or type both values yourself. Your video stays on your device.",
          "Try a video bitrate and audio bitrate, then use the range for storage and transfer planning. The result is arithmetic, not a promise of encoder quality or exact output size.",
        ]}
      />
      <ResourceFaq faqs={videoCompressionEstimatorFaqs} />
      <ResourcePricingCta toolKey={tool.key} variant={variant} />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
