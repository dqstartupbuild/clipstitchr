import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { appCategoryHookPacksDefinition } from "@/lib/clipstitchr/tools/appCategoryHookPacks/appCategoryHookPacksDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-category-hook-packs"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function AppCategoryHookPacksRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    appCategoryHookPacksDefinition.resourceKey,
    false,
  );

  return (
    <CollectionResourcePage
      definition={appCategoryHookPacksDefinition}
      variant={variant}
    />
  );
}
