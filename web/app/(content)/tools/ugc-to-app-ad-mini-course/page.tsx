import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { ugcMiniCourseDefinition } from "@/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["ugc-to-app-ad-mini-course"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default function UgcMiniCourseRoutePage() {
  return <GuidedResourcePage definition={ugcMiniCourseDefinition} />;
}
