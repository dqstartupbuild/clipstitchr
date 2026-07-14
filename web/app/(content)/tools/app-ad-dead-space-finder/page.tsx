import { DeadSpaceFinderPage } from "@/app/_components/tools/dead-space-finder/DeadSpaceFinderPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["app-ad-dead-space-finder"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function DeadSpaceFinderRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    resource.key,
    false,
  );

  return <DeadSpaceFinderPage variant={variant} />;
}
