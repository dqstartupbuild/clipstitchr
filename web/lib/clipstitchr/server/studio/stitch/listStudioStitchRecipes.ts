import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";

export async function listStudioStitchRecipes(
  productId: string,
  includeArchived: boolean,
) {
  const convex = await getStudioStitchConvexClient();
  await convex.mutation(
    api.studioReelRateLimits.consumeStaticRead.consumeStaticRead,
    { productId },
  );
  return await convex.query(api.studioReelRecipes.list.list, {
    productId,
    includeArchived,
    limit: 100,
  });
}
