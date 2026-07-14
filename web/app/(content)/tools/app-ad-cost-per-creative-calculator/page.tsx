import { AppAdCostPerCreativePage } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativePage";
import { appAdCostPerCreativeDescription } from "@/lib/clipstitchr/tools/appAdCostPerCreative/appAdCostPerCreativeDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App Ad Cost per Creative Calculator | ${site.name}`,
  description: appAdCostPerCreativeDescription,
  canonical: "/tools/app-ad-cost-per-creative-calculator",
  keywords: publicToolCatalog["app-ad-cost-per-creative-calculator"].keywords,
});

export default async function AppAdCostPerCreativeRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ad-cost-per-creative-calculator",
    false,
  );

  return <AppAdCostPerCreativePage variant={variant} />;
}
