export type StitchScore = {
  overallRetentionEstimate: number;
  hookToDemoFlow: number;
  summary: string;
  dropOffRiskPoints: string[];
  suggestedTrims: string[];
  suggestedOverlayText: string[];
  suggestedOpeningLine: string;
};
