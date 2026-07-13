import { TikTokSafeZonePage } from "@/app/_components/tools/tiktok-safe-zone/TikTokSafeZonePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["tiktok-safe-zone-overlay"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function TikTokSafeZoneRoutePage() {
  return <TikTokSafeZonePage />;
}
