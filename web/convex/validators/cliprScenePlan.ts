import { v } from "convex/values";
import { r2ObjectValidator } from "./r2Object";

export const cliprScenePlanValidator = v.object({
  id: v.string(),
  index: v.number(),
  sceneType: v.literal("avatar"),
  scriptText: v.string(),
  visualPrompt: v.string(),
  photoScript: v.optional(v.string()),
  estimatedDurationSeconds: v.number(),
  voiceAudioObject: v.optional(r2ObjectValidator),
  generatedImageObject: v.optional(r2ObjectValidator),
  generatedVideoObject: v.optional(r2ObjectValidator),
  providerImagePredictionId: v.optional(v.string()),
  providerPredictionId: v.optional(v.string()),
});
