import { CompetitorHookResearchPage } from "@/app/_components/tools/competitor-hook-research/CompetitorHookResearchPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["competitor-hook-research-worksheet"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function CompetitorHookResearchRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    tool.key,
    false,
  );

  return <CompetitorHookResearchPage variant={variant} />;
}
