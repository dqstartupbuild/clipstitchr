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
  sharedTrackId: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  title: v.optional(v.string()),
  updatedAt: v.string(),
  volume: v.number(),
});
