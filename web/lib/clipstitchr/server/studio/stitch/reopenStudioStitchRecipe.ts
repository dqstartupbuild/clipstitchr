import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";

export async function reopenStudioStitchRecipe(
  id: string,
  request: {
    readonly productId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
  },
) {
  return await (
    await getStudioStitchConvexClient()
  ).mutation(api.studioReelRecipes.reopen.reopen, { id, ...request });
}
