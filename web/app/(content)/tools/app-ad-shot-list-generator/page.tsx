import { AppAdShotListPage } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListPage";
import { appAdShotListDescription } from "@/lib/clipstitchr/tools/appAdShotList/appAdShotListDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App Ad Shot List Generator | ${site.name}`,
  description: appAdShotListDescription,
  canonical: "/tools/app-ad-shot-list-generator",
  keywords: publicToolCatalog["app-ad-shot-list-generator"].keywords,
});

export default async function AppAdShotListRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ad-shot-list-generator",
    false,
  );

  return <AppAdShotListPage variant={variant} />;
}
