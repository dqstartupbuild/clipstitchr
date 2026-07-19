import { v } from "convex/values";
import { hookLabPostPerformanceAnalysisValidator } from "./hookLabPostPerformanceAnalysis";
import { hookLabPostTimelineEntryValidator } from "./hookLabPostTimelineEntry";

export const hookLabPostAnalysisValidator = v.object({
  callToAction: v.string(),
  contentSummary: v.string(),
  format: v.string(),
  openingHook: v.string(),
  performance: hookLabPostPerformanceAnalysisValidator,
  timeline: v.array(hookLabPostTimelineEntryValidator),
  transferableLessons: v.array(v.string()),
});
