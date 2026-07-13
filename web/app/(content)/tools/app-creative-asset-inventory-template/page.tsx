import { CreativeAssetInventoryPage } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-creative-asset-inventory-template"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function CreativeAssetInventoryRoutePage() {
  return <CreativeAssetInventoryPage />;
}
