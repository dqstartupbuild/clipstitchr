import type { StudioStitchWordTiming } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";

export type StudioReelCheckpointVoice = {
  readonly contentType: "audio/mp4";
  readonly durationSeconds: number;
  readonly objectKey: string;
  readonly objectVersion: string;
  readonly rawDurationSeconds: number;
  readonly recipeId: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly tempoFactor: number;
  readonly timelineWordTimings: readonly StudioStitchWordTiming[];
};
