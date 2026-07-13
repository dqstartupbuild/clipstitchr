import { VideoCompressionEstimator } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionEstimator";
import { ResourceFaq } from "@/app/_components/tools/resources/ResourceFaq";
import { ResourceGuide } from "@/app/_components/tools/resources/ResourceGuide";
import { ResourceHero } from "@/app/_components/tools/resources/ResourceHero";
import { ResourcePricingCta } from "@/app/_components/tools/resources/ResourcePricingCta";
import { ToolDiscoveryLinks } from "@/app/_components/tools/ToolDiscoveryLinks";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { ToolStructuredData } from "@/app/_components/tools/ToolStructuredData";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { videoCompressionEstimatorFaqs } from "@/lib/clipstitchr/tools/videoCompressionEstimator/videoCompressionEstimatorFaqs";

const tool = publicToolCatalog["app-video-compression-estimator"];

export function VideoCompressionEstimatorPage() {
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
          <ToolLeadCaptureForm source={tool.key} />
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
      <ResourcePricingCta />
      <ToolDiscoveryLinks currentToolKey={tool.key} />
    </>
  );
}
