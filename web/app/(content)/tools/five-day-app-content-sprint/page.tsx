import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { fiveDayContentSprintDefinition } from "@/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition";
import { getCourseWorkspaceStateForRequest } from "@/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["five-day-app-content-sprint"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function FiveDayContentSprintRoutePage() {
  const isEmailProviderReady = getLoopsReadiness(process.env).emailNativeReady;
  const variant = await resolvePublicToolGateVariantForRequest(
    fiveDayContentSprintDefinition.resourceKey,
    isEmailProviderReady,
  );
  const courseWorkspaceState = await getCourseWorkspaceStateForRequest(
    "five-day-app-content-sprint",
  );

  return (
    <GuidedResourcePage
      courseWorkspaceState={courseWorkspaceState}
      definition={fiveDayContentSprintDefinition}
      isEmailProviderReady={isEmailProviderReady}
      variant={variant}
    />
  );
}
