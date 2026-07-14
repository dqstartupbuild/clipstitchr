import { AppAdCreativeFatiguePage } from "@/app/_components/tools/app-ad-creative-fatigue-calculator/AppAdCreativeFatiguePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-ad-creative-fatigue-calculator"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function AppAdCreativeFatigueRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <AppAdCreativeFatiguePage variant={variant} />;
}
