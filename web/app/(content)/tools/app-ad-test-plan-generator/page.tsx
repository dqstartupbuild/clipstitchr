import { AppAdTestPlanPage } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanPage";
import { appAdTestPlanDescription } from "@/lib/clipstitchr/tools/appAdTestPlan/appAdTestPlanDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App Ad Creative Test Plan Generator | ${site.name}`,
  description: appAdTestPlanDescription,
  canonical: "/tools/app-ad-test-plan-generator",
  keywords: publicToolCatalog["app-ad-test-plan-generator"].keywords,
});

export default function AppAdTestPlanRoutePage() {
  return <AppAdTestPlanPage />;
}
