import { AppAdHookGraderPage } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderPage";
import { appAdHookGraderDescription } from "@/lib/clipstitchr/tools/appAdHookGrader/appAdHookGraderDescription";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  canonical: "/tools/app-ad-hook-grader",
  description: appAdHookGraderDescription,
  keywords: [...publicToolCatalog["app-ad-hook-grader"].keywords],
  title: `Hook Strength Grader for App Ads | ${site.name}`,
});

export default async function AppAdHookGraderRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    "app-ad-hook-grader",
    false,
  );

  return <AppAdHookGraderPage variant={variant} />;
}
