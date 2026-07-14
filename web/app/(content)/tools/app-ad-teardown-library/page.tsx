import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { adTeardownLibraryDefinition } from "@/lib/clipstitchr/tools/adTeardownLibrary/adTeardownLibraryDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-ad-teardown-library"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function AdTeardownLibraryRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    adTeardownLibraryDefinition.resourceKey,
    false,
  );

  return (
    <CollectionResourcePage
      definition={adTeardownLibraryDefinition}
      variant={variant}
    />
  );
}
