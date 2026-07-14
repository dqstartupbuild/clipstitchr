import { ClipNamingSystemPage } from "@/app/_components/tools/clip-naming-system-generator/ClipNamingSystemPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["clip-naming-system-generator"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function ClipNamingSystemRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(tool.key, false);

  return <ClipNamingSystemPage variant={variant} />;
}
