import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { appDemoVideoHooksDefinition } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooksDefinition";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["100-app-demo-video-hooks"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function AppDemoVideoHooksRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    appDemoVideoHooksDefinition.resourceKey,
    false,
  );

  return (
    <CollectionResourcePage
      definition={appDemoVideoHooksDefinition}
      variant={variant}
    />
  );
}
