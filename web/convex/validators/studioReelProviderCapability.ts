import { v } from "convex/values";

export const studioReelProviderCapabilityValidator = v.union(
  v.literal("reactionFootage"),
  v.literal("demoIntelligence"),
  v.literal("voiceWordTimings"),
  v.literal("mediaRendering"),
);
