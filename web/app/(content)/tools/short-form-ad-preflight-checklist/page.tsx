import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { shortFormAdPreflightDefinition } from "@/lib/clipstitchr/tools/shortFormAdPreflight/shortFormAdPreflightDefinition";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["short-form-ad-preflight-checklist"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function ShortFormAdPreflightRoutePage() {
  return <GuidedResourcePage definition={shortFormAdPreflightDefinition} />;
}
