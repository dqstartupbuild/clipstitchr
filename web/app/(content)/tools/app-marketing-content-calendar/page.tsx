import { AppMarketingContentCalendarPage } from "@/app/_components/tools/app-marketing-content-calendar/AppMarketingContentCalendarPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-marketing-content-calendar"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function AppMarketingContentCalendarRoutePage() {
  return <AppMarketingContentCalendarPage />;
}
