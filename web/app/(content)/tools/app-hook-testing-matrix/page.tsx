import { AppHookTestingMatrixPage } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-hook-testing-matrix"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default function AppHookTestingMatrixRoutePage() {
  return <AppHookTestingMatrixPage />;
}
