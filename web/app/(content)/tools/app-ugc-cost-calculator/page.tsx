import { AppUgcCostCalculatorPage } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorPage";
import { appUgcCostDescription } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App UGC Production Cost Calculator | ${site.name}`,
  description: appUgcCostDescription,
  canonical: "/tools/app-ugc-cost-calculator",
  keywords: publicToolCatalog["app-ugc-cost-calculator"].keywords,
});

export default function AppUgcCostCalculatorRoutePage() {
  return <AppUgcCostCalculatorPage />;
}
