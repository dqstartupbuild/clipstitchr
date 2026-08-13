import type { StudioStitchCaptionTimingContract } from "./StudioStitchCaptionTimingContract";

export type StudioStitchCaptionPlan = {
  readonly state: "ready" | "pendingWordTimings";
  readonly timingContract: StudioStitchCaptionTimingContract;
  readonly cueOverlayIds: readonly string[];
};
