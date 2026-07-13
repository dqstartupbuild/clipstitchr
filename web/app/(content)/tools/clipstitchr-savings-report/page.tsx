import { ClipStitchrSavingsPage } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["clipstitchr-savings-report"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function ClipStitchrSavingsRoutePage() {
  return <ClipStitchrSavingsPage />;
}
