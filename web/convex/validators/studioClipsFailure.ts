import { v } from "convex/values";

export const studioClipsFailureValidator = v.object({
  code: v.string(),
  kind: v.union(v.literal("permanent"), v.literal("retryable")),
  message: v.string(),
});
