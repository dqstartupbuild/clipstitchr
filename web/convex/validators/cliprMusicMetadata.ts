import { v } from "convex/values";
import { r2ObjectValidator } from "./r2Object";

export const cliprMusicMetadataValidator = v.object({
  audioObject: r2ObjectValidator,
  createdAt: v.string(),
  durationSeconds: v.number(),
  enabled: v.boolean(),
  prompt: v.string(),
  providerModel: v.string(),
  providerPredictionId: v.string(),
  updatedAt: v.string(),
  volume: v.number(),
});
