import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

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
  videoUrl: string;
  voice: string;
};
