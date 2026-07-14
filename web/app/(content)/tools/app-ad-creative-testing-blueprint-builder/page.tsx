import { AppAdCreativeTestingBlueprintPage } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintPage";
import { appAdCreativeTestingBlueprintDescription } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/appAdCreativeTestingBlueprintDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App Ad Creative Testing Blueprint Builder | ${site.name}`,
  description: appAdCreativeTestingBlueprintDescription,
  canonical: "/tools/app-ad-creative-testing-blueprint-builder",
  keywords:
    publicToolCatalog["app-ad-creative-testing-blueprint-builder"].keywords,
});

export default async function AppAdCreativeTestingBlueprintRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ad-creative-testing-blueprint-builder",
    false,
  );

  return <AppAdCreativeTestingBlueprintPage variant={variant} />;
}
