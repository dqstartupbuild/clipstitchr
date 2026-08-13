import { v } from "convex/values";
import { studioReelProviderValidator } from "./studioReelProvider";
import { studioReelProviderCapabilityValidator } from "./studioReelProviderCapability";

export const studioReelProviderReadinessValidator = v.object({
  provider: studioReelProviderValidator,
  capability: studioReelProviderCapabilityValidator,
  state: v.union(v.literal("configured"), v.literal("unavailable")),
  reason: v.union(v.string(), v.null()),
});
