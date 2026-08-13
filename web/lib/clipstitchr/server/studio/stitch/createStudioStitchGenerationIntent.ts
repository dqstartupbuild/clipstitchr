import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";

export async function createStudioStitchGenerationIntent(request: {
  readonly runId: string;
  readonly reviewSubsetId: string;
  readonly productId: string;
  readonly recipeIds: readonly string[];
  readonly reviewCount: number;
  readonly idempotencyKey: string;
}) {
  return await (
    await getStudioStitchConvexClient()
  ).mutation(api.studioReelGenerationRuns.createIntent.createIntent, {
    id: request.runId,
    productId: request.productId,
    reviewSubsetId: request.reviewSubsetId,
    recipeIds: [...request.recipeIds],
    reviewCount: request.reviewCount,
    providerReadiness: getStudioStitchProviderReadiness(),
    idempotencyKey: request.idempotencyKey,
  });
}
