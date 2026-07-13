import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { whyDidThisAdWorkDefinition } from "@/lib/clipstitchr/tools/whyDidThisAdWork/whyDidThisAdWorkDefinition";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["why-did-this-ad-work-template"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function WhyDidThisAdWorkRoutePage() {
  return <GuidedResourcePage definition={whyDidThisAdWorkDefinition} />;
}
