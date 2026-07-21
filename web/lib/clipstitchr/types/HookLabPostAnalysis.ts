import type { HookLabPostPerformanceAnalysis } from "@/lib/clipstitchr/types/HookLabPostPerformanceAnalysis";
import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";

export type HookLabPostAnalysis = {
  callToAction: string;
  caption?: string;
  contentSummary: string;
  format: string;
  onScreenText?: string[];
  openingHook: string;
  performance: HookLabPostPerformanceAnalysis;
  timeline: HookLabPostTimelineEntry[];
  transferableLessons: string[];
};
