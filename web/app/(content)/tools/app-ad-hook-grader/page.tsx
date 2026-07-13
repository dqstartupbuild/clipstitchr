import { AppAdHookGraderPage } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderPage";
import { appAdHookGraderDescription } from "@/lib/clipstitchr/tools/appAdHookGrader/appAdHookGraderDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  canonical: "/tools/app-ad-hook-grader",
  description: appAdHookGraderDescription,
  keywords: [...publicToolCatalog["app-ad-hook-grader"].keywords],
  title: `Hook Strength Grader for App Ads | ${site.name}`,
});

export default function AppAdHookGraderRoutePage() {
  return <AppAdHookGraderPage />;
}
