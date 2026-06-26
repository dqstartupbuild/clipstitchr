import { v } from "convex/values";

export const stitchScoreReassessmentValidator = v.object({
  completedImprovements: v.array(v.string()),
  remainingImprovements: v.array(v.string()),
  postingReadiness: v.string(),
});
