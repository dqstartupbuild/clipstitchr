import { AppUgcBriefBuilderPage } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderPage";
import { appUgcBriefDescription } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `UGC Ad Brief Builder for Apps | ${site.name}`,
  description: appUgcBriefDescription,
  canonical: "/tools/app-ugc-brief-builder",
  keywords: publicToolCatalog["app-ugc-brief-builder"].keywords,
});

export default function AppUgcBriefBuilderRoutePage() {
  return <AppUgcBriefBuilderPage />;
}
