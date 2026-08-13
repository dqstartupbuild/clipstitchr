import type { StudioStitchWordTiming } from "./StudioStitchWordTiming";

export type StudioStitchVoicePlan = {
  readonly voiceId: string;
  readonly voiceName: string;
  readonly modelId: string;
  readonly script: string;
  readonly speed: number;
  readonly stability: number;
  readonly similarityBoost: number;
  readonly style: number;
  readonly speakerBoost: true;
  readonly targetDurationSeconds: number;
  readonly rawDurationSeconds: number | null;
  readonly tempoFactor: number | null;
  readonly timingState: "provided" | "pendingProvider";
  readonly sourceWordTimings: readonly StudioStitchWordTiming[];
  readonly timelineWordTimings: readonly StudioStitchWordTiming[];
  readonly groundingClaimIds: readonly string[];
  readonly targetWordCountMinimum: number;
  readonly targetWordCountMaximum: number;
  readonly actualWordCount: number;
};
