import { ThirtyDayContentPlanPage } from "@/app/_components/tools/thirty-day-content-plan/ThirtyDayContentPlanPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const tool = publicToolCatalog["30-day-app-content-plan"];

export const metadata = createPageMetadata({
  canonical: tool.pathname,
  description: tool.description,
  keywords: tool.keywords,
  title: `${tool.name} | ${site.name}`,
});

export default async function ThirtyDayContentPlanRoutePage() {
  const variant = await resolvePublicToolGateVariantForRequest(
    tool.key,
    false,
  );

  return <ThirtyDayContentPlanPage variant={variant} />;
}
