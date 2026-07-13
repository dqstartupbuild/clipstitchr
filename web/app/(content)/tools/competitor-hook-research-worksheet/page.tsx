import { CompetitorHookResearchPage } from "@/app/_components/tools/competitor-hook-research/CompetitorHookResearchPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["competitor-hook-research-worksheet"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function CompetitorHookResearchRoutePage() {
  return <CompetitorHookResearchPage />;
}
