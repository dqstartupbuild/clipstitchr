import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { ugcMiniCourseDefinition } from "@/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition";
import { getCourseWorkspaceStateForRequest } from "@/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["ugc-to-app-ad-mini-course"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function UgcMiniCourseRoutePage() {
  const isEmailProviderReady = getLoopsReadiness(process.env).emailNativeReady;
  const variant = await resolvePublicToolGateVariantForRequest(
    ugcMiniCourseDefinition.resourceKey,
    isEmailProviderReady,
  );
  const courseWorkspaceState = await getCourseWorkspaceStateForRequest(
    "ugc-to-app-ad-mini-course",
  );

  return (
    <GuidedResourcePage
      courseWorkspaceState={courseWorkspaceState}
      definition={ugcMiniCourseDefinition}
      isEmailProviderReady={isEmailProviderReady}
      variant={variant}
    />
  );
}
