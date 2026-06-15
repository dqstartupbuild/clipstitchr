import { v } from "convex/values";

export const quickEditCropValidator = v.object({
  mode: v.literal("smart-9x16"),
  removeBlackBars: v.optional(v.boolean()),
  positionX: v.optional(v.number()),
  positionY: v.optional(v.number()),
  scale: v.optional(v.number()),
  reason: v.optional(v.string()),
});
