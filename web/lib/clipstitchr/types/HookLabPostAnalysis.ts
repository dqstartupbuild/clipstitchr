import type { HookLabPostPerformanceAnalysis } from "@/lib/clipstitchr/types/HookLabPostPerformanceAnalysis";
import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";

export type HookLabPostAnalysis = {
  callToAction: string;
  contentSummary: string;
  format: string;
  openingHook: string;
  performance: HookLabPostPerformanceAnalysis;
  timeline: HookLabPostTimelineEntry[];
  transferableLessons: string[];
};
