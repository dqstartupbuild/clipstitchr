import { AppHookTestingMatrixPage } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["app-hook-testing-matrix"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function AppHookTestingMatrixRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    tool.key,
    false,
  );

  return <AppHookTestingMatrixPage variant={variant} />;
}
