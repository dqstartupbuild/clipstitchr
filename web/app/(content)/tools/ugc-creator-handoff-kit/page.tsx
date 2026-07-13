import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
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

export default function UgcCreatorHandoffKitRoutePage() {
  return <GuidedResourcePage definition={ugcCreatorHandoffKitDefinition} />;
}
