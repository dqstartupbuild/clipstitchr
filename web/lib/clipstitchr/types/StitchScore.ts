import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { StitchScoreReassessment } from "@/lib/clipstitchr/types/StitchScoreReassessment";

export type StitchScore = {
  overallRetentionEstimate: number;
  hookToDemoFlow: number;
  summary: string;
  dropOffRiskPoints: string[];
  suggestedTrims: string[];
  suggestedOverlayText: string[];
  suggestedOpeningLine: string;
  quickEditSuggestions?: QuickEditSuggestions;
  reassessment?: StitchScoreReassessment;
};
