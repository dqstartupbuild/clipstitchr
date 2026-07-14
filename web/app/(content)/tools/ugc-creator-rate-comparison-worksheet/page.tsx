import { UgcCreatorRateComparisonPage } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorRateComparisonPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["ugc-creator-rate-comparison-worksheet"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function UgcCreatorRateComparisonRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <UgcCreatorRateComparisonPage variant={variant} />;
}
