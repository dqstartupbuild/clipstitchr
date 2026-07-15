import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { testingSystemWorkshopDefinition } from "@/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition";
import { getCourseWorkspaceStateForRequest } from "@/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-creative-testing-system-workshop"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function TestingSystemWorkshopRoutePage() {
  const isEmailProviderReady = getLoopsReadiness(process.env).emailNativeReady;
  const variant = await resolvePublicToolGateVariantForRequest(
    testingSystemWorkshopDefinition.resourceKey,
    isEmailProviderReady,
  );
  const courseWorkspaceState = await getCourseWorkspaceStateForRequest(
    "app-creative-testing-system-workshop",
  );

  return (
    <GuidedResourcePage
      courseWorkspaceState={courseWorkspaceState}
      definition={testingSystemWorkshopDefinition}
      isEmailProviderReady={isEmailProviderReady}
      variant={variant}
    />
  );
}
