import { ShortFormAuditPage } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["personalized-short-form-content-audit"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function ShortFormAuditRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <ShortFormAuditPage variant={variant} />;
}
