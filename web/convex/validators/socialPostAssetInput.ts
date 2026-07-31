import { v } from "convex/values";
import { socialAssetKindValidator } from "./socialAssetKind";

export const socialPostAssetInputValidator = v.object({
  id: v.string(),
  order: v.number(),
  kind: socialAssetKindValidator,
  objectKey: v.string(),
  contentType: v.string(),
  sizeBytes: v.number(),
  checksum: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  durationSeconds: v.optional(v.number()),
});
