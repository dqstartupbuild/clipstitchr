import { AppAdBreakEvenPage } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenPage";
import { appAdBreakEvenDescription } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App Ad Break-Even Calculator | ${site.name}`,
  description: appAdBreakEvenDescription,
  canonical: "/tools/app-ad-break-even-calculator",
  keywords: publicToolCatalog["app-ad-break-even-calculator"].keywords,
});

export default function AppAdBreakEvenRoutePage() {
  return <AppAdBreakEvenPage />;
}
