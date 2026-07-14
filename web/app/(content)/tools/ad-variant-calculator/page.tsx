import { AdVariantCalculatorPage } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { adVariantCalculatorDescription } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";

export const metadata = createPageMetadata({
  title: `Ad Variant Calculator for App Marketing | ${site.name}`,
  description: adVariantCalculatorDescription,
  canonical: "/tools/ad-variant-calculator",
  keywords: publicToolCatalog["ad-variant-calculator"].keywords,
});

export default async function AdVariantCalculatorRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "ad-variant-calculator",
    false,
  );

  return <AdVariantCalculatorPage variant={variant} />;
}
