import { CreativeTestingTrackerPage } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingTrackerPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["tiktok-reels-creative-testing-tracker"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function CreativeTestingTrackerRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    tool.key,
    false,
  );

  return <CreativeTestingTrackerPage variant={variant} />;
}
