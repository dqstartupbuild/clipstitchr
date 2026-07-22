import { v } from "convex/values";

export const hookLabPostTimelineEntryValidator = v.object({
  actionsAndReactions: v.optional(v.string()),
  audio: v.optional(v.string()),
  editingAndSound: v.optional(v.string()),
  endSeconds: v.number(),
  facialExpressionAndBodyLanguage: v.optional(v.string()),
  likelySubtext: v.optional(v.string()),
  objectsAndPlacement: v.optional(v.string()),
  onScreenText: v.optional(v.string()),
  recreationEssentials: v.optional(v.string()),
  startSeconds: v.number(),
  visual: v.string(),
});
