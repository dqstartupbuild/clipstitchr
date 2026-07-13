import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { appAdHookStructuresDefinition } from "@/lib/clipstitchr/tools/appAdHookStructures/appAdHookStructuresDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-ad-hook-structures"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function AppAdHookStructuresRoutePage() {
  return <CollectionResourcePage definition={appAdHookStructuresDefinition} />;
}
