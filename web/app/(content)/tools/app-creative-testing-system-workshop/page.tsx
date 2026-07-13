import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { testingSystemWorkshopDefinition } from "@/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-creative-testing-system-workshop"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function TestingSystemWorkshopRoutePage() {
  return <GuidedResourcePage definition={testingSystemWorkshopDefinition} />;
}
