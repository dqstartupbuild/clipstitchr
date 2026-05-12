import { v } from "convex/values";

export const swaprMetadataValidator = v.object({
  source: v.literal("swapr"),
  sourcePhotoId: v.string(),
  referenceUgcClipId: v.string(),
  replicatePredictionId: v.string(),
  replicatePredictionIds: v.optional(v.array(v.string())),
  modelId: v.string(),
  mode: v.union(v.literal("std"), v.literal("pro")),
  characterOrientation: v.union(v.literal("image"), v.literal("video")),
  prompt: v.optional(v.string()),
  keepOriginalSound: v.boolean(),
  sourceSegmentIndex: v.optional(v.number()),
  sourceSegmentCount: v.optional(v.number()),
  sourceSegmentStartSeconds: v.optional(v.number()),
  sourceSegmentEndSeconds: v.optional(v.number()),
  segmentClipIds: v.optional(v.array(v.string())),
});
