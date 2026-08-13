import { api } from "@/convex/_generated/api";
import { getLazyReelResearchCatalog } from "@/lib/clipstitchr/server/studio/lazyreel/getLazyReelResearchCatalog";
import { listLazyReelWorkflowDefinitions } from "@/lib/clipstitchr/server/studio/lazyreel/listLazyReelWorkflowDefinitions";
import { getStudioLazyReelConvexClient } from "./getStudioLazyReelConvexClient";

export async function getStudioLazyReelCatalog(productId: string) {
  const convex = await getStudioLazyReelConvexClient();

  await convex.mutation(
    api.studioLazyReelRateLimits.consumeStaticRead.consumeStaticRead,
    { productId },
  );

  return {
    catalog: getLazyReelResearchCatalog(),
    workflows: listLazyReelWorkflowDefinitions(),
  };
}
