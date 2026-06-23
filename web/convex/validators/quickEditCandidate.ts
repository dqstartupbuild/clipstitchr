import { v } from "convex/values";
import { quickEditCandidateSignalValidator } from "./quickEditCandidateSignal";

export const quickEditCandidateValidator = v.object({
  start: v.number(),
  end: v.number(),
  confidence: v.number(),
  signals: v.array(quickEditCandidateSignalValidator),
  reason: v.optional(v.string()),
  stats: v.optional(v.string()),
});
