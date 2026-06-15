import { v } from "convex/values";

export const quickEditOverlayTextValidator = v.object({
  replaceWith: v.string(),
  reason: v.optional(v.string()),
});
