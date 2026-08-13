import { v } from "convex/values";
import { r2ObjectValidator } from "./r2Object";

export const swipePublishingBundleSlideValidator = v.object({
  checksumSha256: v.string(),
  etag: v.optional(v.string()),
  height: v.number(),
  index: v.number(),
  object: r2ObjectValidator,
  versionId: v.optional(v.string()),
  width: v.number(),
});
