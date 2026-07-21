import type { HookLabPostPerformanceAnalysis } from "@/lib/clipstitchr/types/HookLabPostPerformanceAnalysis";
import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";
import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";

export type HookLabPostAnalysis = {
  callToAction: string;
  caption?: string;
  copyabilityWarnings?: string[];
  contentSummary: string;
  format: string;
  formatDna?: HookLabFormatDna;
  onScreenText?: string[];
  openingHook: string;
  performance: HookLabPostPerformanceAnalysis;
  timeline: HookLabPostTimelineEntry[];
  transferableLessons: string[];
};
