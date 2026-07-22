import { v } from "convex/values";
import { hookLabPostPerformanceAnalysisValidator } from "./hookLabPostPerformanceAnalysis";
import { hookLabPostTimelineEntryValidator } from "./hookLabPostTimelineEntry";
import { hookLabFormatDnaValidator } from "./hookLabFormatDna";

export const hookLabPostAnalysisValidator = v.object({
  callToAction: v.string(),
  caption: v.optional(v.string()),
  copyabilityWarnings: v.optional(v.array(v.string())),
  contentSummary: v.string(),
  culturalContext: v.optional(v.string()),
  formatDna: v.optional(hookLabFormatDnaValidator),
  format: v.string(),
  likelySubtext: v.optional(v.string()),
  onScreenText: v.optional(v.array(v.string())),
  openingHook: v.string(),
  performance: hookLabPostPerformanceAnalysisValidator,
  recreationEssentials: v.optional(v.array(v.string())),
  timeline: v.array(hookLabPostTimelineEntryValidator),
  transferableLessons: v.array(v.string()),
});
