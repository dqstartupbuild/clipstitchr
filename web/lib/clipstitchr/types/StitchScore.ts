import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export type StitchScore = {
  overallRetentionEstimate: number;
  hookToDemoFlow: number;
  summary: string;
  dropOffRiskPoints: string[];
  suggestedTrims: string[];
  suggestedOverlayText: string[];
  suggestedOpeningLine: string;
  quickEditSuggestions?: QuickEditSuggestions;
};
