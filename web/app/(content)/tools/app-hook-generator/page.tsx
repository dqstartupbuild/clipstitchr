import { AppHookGeneratorPage } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { appHookGeneratorDescription } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

export const metadata = createPageMetadata({
  title: `App Hook Generator for Short-Form Ads | ${site.name}`,
  description: appHookGeneratorDescription,
  canonical: "/tools/app-hook-generator",
  keywords: publicToolCatalog["app-hook-generator"].keywords,
});

export default function AppHookGeneratorRoutePage() {
  return <AppHookGeneratorPage />;
}
