import { AppHookGeneratorPage } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { appHookGeneratorDescription } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";

export const metadata = createPageMetadata({
  title: `App Hook Generator for Short-Form Ads | ${site.name}`,
  description: appHookGeneratorDescription,
  canonical: "/tools/app-hook-generator",
  keywords: publicToolCatalog["app-hook-generator"].keywords,
});

export default async function AppHookGeneratorRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-hook-generator",
    false,
  );

  return <AppHookGeneratorPage variant={variant} />;
}
