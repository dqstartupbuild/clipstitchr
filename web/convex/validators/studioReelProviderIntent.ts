import { v } from "convex/values";
import { studioReelProviderValidator } from "./studioReelProvider";
import { studioReelProviderCapabilityValidator } from "./studioReelProviderCapability";

export const studioReelProviderIntentValidator = v.object({
  provider: studioReelProviderValidator,
  capability: studioReelProviderCapabilityValidator,
  state: v.union(
    v.literal("intentReady"),
    v.literal("unavailable"),
    v.literal("satisfiedByInput"),
  ),
  recipeCount: v.number(),
  reason: v.union(v.string(), v.null()),
});
