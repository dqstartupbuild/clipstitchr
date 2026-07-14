import { AppUgcCostCalculatorPage } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorPage";
import { appUgcCostDescription } from "@/lib/clipstitchr/tools/appUgcCostCalculator/appUgcCostDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App UGC Production Cost Calculator | ${site.name}`,
  description: appUgcCostDescription,
  canonical: "/tools/app-ugc-cost-calculator",
  keywords: publicToolCatalog["app-ugc-cost-calculator"].keywords,
});

export default async function AppUgcCostCalculatorRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ugc-cost-calculator",
    false,
  );

  return <AppUgcCostCalculatorPage variant={variant} />;
}
