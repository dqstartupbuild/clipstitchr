export type StudioStitchTransitionPlan = {
  readonly id: string;
  readonly fromSegmentId: string;
  readonly toSegmentId: string;
  readonly kind: "cut" | "crossfade" | "dipToBlack";
  readonly durationSeconds: number;
};
