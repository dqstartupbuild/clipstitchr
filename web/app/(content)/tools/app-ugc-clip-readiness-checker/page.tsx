import { AppUgcClipReadinessPage } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessPage";
import { appUgcClipReadinessDescription } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipReadinessDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `App UGC Clip Readiness Checker | ${site.name}`,
  description: appUgcClipReadinessDescription,
  canonical: "/tools/app-ugc-clip-readiness-checker",
  keywords: publicToolCatalog["app-ugc-clip-readiness-checker"].keywords,
});

export default async function AppUgcClipReadinessRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ugc-clip-readiness-checker",
    false,
  );

  return <AppUgcClipReadinessPage variant={variant} />;
}
