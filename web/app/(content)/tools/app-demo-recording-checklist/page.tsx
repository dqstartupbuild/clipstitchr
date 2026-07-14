import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { appDemoRecordingChecklistDefinition } from "@/lib/clipstitchr/tools/appDemoRecordingChecklist/appDemoRecordingChecklistDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-demo-recording-checklist"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function AppDemoRecordingChecklistRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    appDemoRecordingChecklistDefinition.resourceKey,
    false,
  );

  return (
    <GuidedResourcePage
      definition={appDemoRecordingChecklistDefinition}
      variant={variant}
    />
  );
}
