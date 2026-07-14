import { ClipStitchrSavingsPage } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["clipstitchr-savings-report"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function ClipStitchrSavingsRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <ClipStitchrSavingsPage variant={variant} />;
}
