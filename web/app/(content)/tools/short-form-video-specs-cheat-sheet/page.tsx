import { ShortFormVideoSpecsPage } from "@/app/_components/tools/short-form-video-specs/ShortFormVideoSpecsPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["short-form-video-specs-cheat-sheet"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function ShortFormVideoSpecsRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    resource.key,
    false,
  );

  return <ShortFormVideoSpecsPage variant={variant} />;
}
