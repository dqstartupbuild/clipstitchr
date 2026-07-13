import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { appUgcAdBriefTemplateDefinition } from "@/lib/clipstitchr/tools/appUgcAdBriefTemplate/appUgcAdBriefTemplateDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-ugc-ad-brief-template"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function AppUgcAdBriefTemplateRoutePage() {
  return <GuidedResourcePage definition={appUgcAdBriefTemplateDefinition} />;
}
