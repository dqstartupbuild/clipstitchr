import { ClientContentCapacityPage } from "@/app/_components/tools/client-content-capacity-calculator/ClientContentCapacityPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["client-content-capacity-calculator"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function ClientContentCapacityRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <ClientContentCapacityPage variant={variant} />;
}
