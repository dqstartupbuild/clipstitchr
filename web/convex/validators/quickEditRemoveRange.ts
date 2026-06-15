import { v } from "convex/values";

export const quickEditRemoveRangeValidator = v.object({
  start: v.number(),
  end: v.number(),
  reason: v.optional(v.string()),
});
