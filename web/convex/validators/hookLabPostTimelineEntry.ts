import { v } from "convex/values";

export const hookLabPostTimelineEntryValidator = v.object({
  audio: v.optional(v.string()),
  endSeconds: v.number(),
  onScreenText: v.optional(v.string()),
  startSeconds: v.number(),
  visual: v.string(),
});
