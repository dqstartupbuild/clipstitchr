import type { MutationCtx } from "../_generated/server";
import type { Infer } from "convex/values";
import { studioReelProviderIntentValidator } from "../validators/studioReelProviderIntent";
import { consumeStudioReelProviderIntentRateLimits } from "./consumeStudioReelProviderIntentRateLimits";

type StudioReelProviderIntent = Infer<typeof studioReelProviderIntentValidator>;

export async function consumeStudioReelProviderIntentListRateLimits(
  ctx: MutationCtx,
  ownerId: string,
  intents: readonly StudioReelProviderIntent[],
) {
  for (const intent of intents) {
    if (intent.state === "intentReady") {
      await consumeStudioReelProviderIntentRateLimits(
        ctx,
        ownerId,
        intent.provider,
        intent.recipeCount,
      );
    }
  }
}
