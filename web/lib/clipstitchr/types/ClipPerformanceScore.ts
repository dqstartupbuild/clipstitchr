import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export type ClipPerformanceScore = {
  overall: number;
  hook?: number;
  cameraPresence?: number;
  pacing?: number;
  clarity?: number;
  platformFit?: number;
  stitchFit?: number;
  summary: string;
  bestUse: string;
  strengths: string[];
  fixes: string[];
  quickEditSuggestions?: QuickEditSuggestions;
};
