import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

export type CliprSegmentResponse = {
  audioPredictionId: string;
  avatarPrompt: string;
  durationSeconds: CliprDurationSeconds;
  hook: string;
  modelIds: {
    avatar: string;
    script: string;
    textToSpeech: string;
  };
  script: string;
  segmentIndex: number;
  styleKey: string;
  templateId: string;
  title: string;
  videoPredictionId: string;
  videoStatus: SwaprPredictionStatus;
  videoUrl?: string;
  voice: string;
};
