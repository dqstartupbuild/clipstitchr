export type AppAdHookGradeDimension = {
  key:
    | "audience-fit"
    | "claim-safety"
    | "clarity"
    | "curiosity"
    | "specificity"
    | "visual-bridge";
  label: string;
  reason: string;
  score: number;
};
