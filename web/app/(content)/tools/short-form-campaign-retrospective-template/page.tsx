import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { campaignRetrospectiveDefinition } from "@/lib/clipstitchr/tools/campaignRetrospective/campaignRetrospectiveDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource =
  publicToolCatalog["short-form-campaign-retrospective-template"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function CampaignRetrospectiveRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    campaignRetrospectiveDefinition.resourceKey,
    false,
  );

  return (
    <GuidedResourcePage
      definition={campaignRetrospectiveDefinition}
      variant={variant}
    />
  );
}
