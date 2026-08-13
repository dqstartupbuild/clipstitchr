import type { StudioStitchWordTiming } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";

export type StudioReelVoiceArtifact = {
  readonly localPath: string;
  readonly rawDurationSeconds: number;
  readonly tempoFactor: number;
  readonly timelineWordTimings: readonly StudioStitchWordTiming[];
};
