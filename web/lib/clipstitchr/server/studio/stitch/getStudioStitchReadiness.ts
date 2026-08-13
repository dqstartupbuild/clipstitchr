import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";

export async function getStudioStitchReadiness(productId: string) {
  const convex = await getStudioStitchConvexClient();
  await convex.mutation(
    api.studioReelRateLimits.consumeStaticRead.consumeStaticRead,
    { productId },
  );
  const providers = getStudioStitchProviderReadiness();
  return {
    providers,
    state: providers.every((provider) => provider.state === "configured")
      ? ("configured" as const)
      : ("unavailable" as const),
    execution: "notStarted" as const,
  };
}
