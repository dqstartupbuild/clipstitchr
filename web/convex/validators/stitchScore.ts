import { v } from "convex/values";

export const stitchScoreValidator = v.object({
  overallRetentionEstimate: v.number(),
  hookToDemoFlow: v.number(),
  summary: v.string(),
  dropOffRiskPoints: v.array(v.string()),
  suggestedTrims: v.array(v.string()),
  suggestedOverlayText: v.array(v.string()),
  suggestedOpeningLine: v.string(),
});
