import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";

export async function changeStudioStitchGenerationRun(
  action: "cancel" | "resume" | "retry",
  id: string,
  request: {
    readonly productId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
  },
) {
  const convex = await getStudioStitchConvexClient();
  if (action === "cancel") {
    return await convex.mutation(api.studioReelGenerationRuns.cancel.cancel, {
      id,
      ...request,
    });
  }
  const args = {
    id,
    ...request,
    providerReadiness: getStudioStitchProviderReadiness(),
  };
  return action === "resume"
    ? await convex.mutation(api.studioReelGenerationRuns.resume.resume, args)
    : await convex.mutation(api.studioReelGenerationRuns.retry.retry, args);
}
