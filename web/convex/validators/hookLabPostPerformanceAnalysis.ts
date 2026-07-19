import { v } from "convex/values";

export const hookLabPostPerformanceAnalysisValidator = v.object({
  confidence: v.string(),
  engagementExplanation: v.string(),
  hookScore: v.number(),
  limitations: v.array(v.string()),
  overallScore: v.number(),
  pacingScore: v.number(),
  platformFitScore: v.number(),
  retentionExplanation: v.string(),
  strengths: v.array(v.string()),
});
