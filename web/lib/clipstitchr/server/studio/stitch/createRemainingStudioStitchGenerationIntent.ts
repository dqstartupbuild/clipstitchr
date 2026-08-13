import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";

export async function createRemainingStudioStitchGenerationIntent(
  parentRunId: string,
  request: {
    readonly remainingRunId: string;
    readonly productId: string;
    readonly idempotencyKey: string;
  },
) {
  return await (
    await getStudioStitchConvexClient()
  ).mutation(
    api.studioReelGenerationRuns.createRemainingIntent.createRemainingIntent,
    {
      id: request.remainingRunId,
      parentRunId,
      productId: request.productId,
      providerReadiness: getStudioStitchProviderReadiness(),
      idempotencyKey: request.idempotencyKey,
    },
  );
}
