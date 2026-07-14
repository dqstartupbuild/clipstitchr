import { NotionKitPage } from "@/app/_components/tools/notion-kit/NotionKitPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const resource = publicToolCatalog["short-form-content-system-notion-kit"];

export const metadata = createPageMetadata({
  title: `${resource.name} | ${site.name}`,
  description: resource.description,
  canonical: resource.pathname,
  keywords: resource.keywords,
});

export default async function NotionKitRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    resource.key,
    false,
  );

  return <NotionKitPage variant={variant} />;
}
