import { v } from "convex/values";

export const studioReelMaterializationProofValidator = v.object({
  audioCodec: v.optional(v.string()),
  byteLength: v.number(),
  contentType: v.literal("video/mp4"),
  durationSeconds: v.number(),
  hasAudio: v.boolean(),
  height: v.number(),
  objectKey: v.string(),
  objectVersion: v.string(),
  sha256: v.string(),
  videoCodec: v.string(),
  width: v.number(),
});
