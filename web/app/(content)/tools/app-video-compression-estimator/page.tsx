import { VideoCompressionEstimatorPage } from "@/app/_components/tools/app-video-compression-estimator/VideoCompressionEstimatorPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-video-compression-estimator"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function VideoCompressionEstimatorRoutePage() {
  return <VideoCompressionEstimatorPage />;
}
