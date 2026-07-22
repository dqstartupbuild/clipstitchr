import type { HookLabPostPerformanceAnalysis } from "@/lib/clipstitchr/types/HookLabPostPerformanceAnalysis";
import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";
import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";

export type HookLabPostAnalysis = {
  callToAction: string;
  caption?: string;
  copyabilityWarnings?: string[];
  contentSummary: string;
  culturalContext?: string;
  format: string;
  formatDna?: HookLabFormatDna;
  likelySubtext?: string;
  onScreenText?: string[];
  openingHook: string;
  performance: HookLabPostPerformanceAnalysis;
  recreationEssentials?: string[];
  timeline: HookLabPostTimelineEntry[];
  transferableLessons: string[];
};
