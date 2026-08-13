import type { StudioStitchWordTiming } from "./StudioStitchWordTiming";

export type StudioStitchVoiceInput = {
  readonly voiceId: string;
  readonly voiceName: string;
  readonly modelId: string;
  readonly speed: number;
  readonly stability: number;
  readonly similarityBoost: number;
  readonly style: number;
  readonly rawDurationSeconds: number | null;
  readonly wordTimings: readonly StudioStitchWordTiming[] | null;
};
