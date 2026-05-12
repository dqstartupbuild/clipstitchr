import { v } from "convex/values";

export const swaprMetadataValidator = v.object({
  source: v.literal("swapr"),
  sourcePhotoId: v.string(),
  referenceUgcClipId: v.string(),
  replicatePredictionId: v.string(),
  modelId: v.string(),
  mode: v.union(v.literal("std"), v.literal("pro")),
  characterOrientation: v.union(v.literal("image"), v.literal("video")),
  prompt: v.optional(v.string()),
  keepOriginalSound: v.boolean(),
});
