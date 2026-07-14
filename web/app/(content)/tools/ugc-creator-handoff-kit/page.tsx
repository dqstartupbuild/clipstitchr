import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { ugcCreatorHandoffKitDefinition } from "@/lib/clipstitchr/tools/ugcCreatorHandoffKit/ugcCreatorHandoffKitDefinition";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["ugc-creator-handoff-kit"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function UgcCreatorHandoffKitRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    ugcCreatorHandoffKitDefinition.resourceKey,
    false,
  );

  return (
    <GuidedResourcePage
      definition={ugcCreatorHandoffKitDefinition}
      variant={variant}
    />
  );
}
