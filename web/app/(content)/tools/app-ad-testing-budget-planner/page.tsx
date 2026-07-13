import { AppAdTestingBudgetPage } from "@/app/_components/tools/app-ad-testing-budget-planner/AppAdTestingBudgetPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-ad-testing-budget-planner"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function AppAdTestingBudgetRoutePage() {
  return <AppAdTestingBudgetPage />;
}
