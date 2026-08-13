import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";

export async function getStudioStitchGenerationRun(
  id: string,
  productId: string,
) {
  const convex = await getStudioStitchConvexClient();
  await convex.mutation(
    api.studioReelRateLimits.consumeStaticRead.consumeStaticRead,
    { productId },
  );
  return await convex.query(api.studioReelGenerationRuns.get.get, {
    id,
    productId,
  });
}
