import { AdVariantCalculatorPage } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { adVariantCalculatorDescription } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

export const metadata = createPageMetadata({
  title: `Ad Variant Calculator for App Marketing | ${site.name}`,
  description: adVariantCalculatorDescription,
  canonical: "/tools/ad-variant-calculator",
  keywords: publicToolCatalog["ad-variant-calculator"].keywords,
});

export default function AdVariantCalculatorRoutePage() {
  return <AdVariantCalculatorPage />;
}
