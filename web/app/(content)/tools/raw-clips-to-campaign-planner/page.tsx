import { RawCampaignPlannerPage } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignPlannerPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["raw-clips-to-campaign-planner"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function RawCampaignPlannerRoutePage() {
  return <RawCampaignPlannerPage />;
}
