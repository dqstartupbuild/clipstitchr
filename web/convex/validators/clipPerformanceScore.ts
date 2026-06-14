import { v } from "convex/values";

export const clipPerformanceScoreValidator = v.object({
  overall: v.number(),
  hook: v.optional(v.number()),
  cameraPresence: v.optional(v.number()),
  pacing: v.optional(v.number()),
  clarity: v.optional(v.number()),
  platformFit: v.optional(v.number()),
  stitchFit: v.optional(v.number()),
  summary: v.string(),
  bestUse: v.string(),
  strengths: v.array(v.string()),
  fixes: v.array(v.string()),
});
