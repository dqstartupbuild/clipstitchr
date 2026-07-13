import { AppAdCreativeFatiguePage } from "@/app/_components/tools/app-ad-creative-fatigue-calculator/AppAdCreativeFatiguePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-ad-creative-fatigue-calculator"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function AppAdCreativeFatigueRoutePage() {
  return <AppAdCreativeFatiguePage />;
}
