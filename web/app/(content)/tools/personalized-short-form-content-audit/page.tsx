import { ShortFormAuditPage } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["personalized-short-form-content-audit"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function ShortFormAuditRoutePage() {
  return <ShortFormAuditPage />;
}
