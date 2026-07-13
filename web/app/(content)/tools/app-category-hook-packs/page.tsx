import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { appCategoryHookPacksDefinition } from "@/lib/clipstitchr/tools/appCategoryHookPacks/appCategoryHookPacksDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-category-hook-packs"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function AppCategoryHookPacksRoutePage() {
  return <CollectionResourcePage definition={appCategoryHookPacksDefinition} />;
}
