import { v } from "convex/values";

export const swipePublishingBackgroundIdentityValidator = v.object({
  checksum: v.optional(v.string()),
  contentType: v.string(),
  id: v.string(),
  objectKey: v.string(),
  sizeBytes: v.number(),
  version: v.optional(v.string()),
});
