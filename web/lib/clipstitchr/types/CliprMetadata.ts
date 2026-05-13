import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

export type CliprMetadata = {
  jobId: string;
  productId: string;
  productName: string;
  avatarId: string;
  avatarPhotoId: string;
  voiceId: string;
  targetDurationSeconds: CliprDurationSeconds;
  hookStyleKey: string;
  hookTemplateId: string;
  filledHook: string;
  variablesUsed: Record<string, string>;
  script: string;
  sceneCount: number;
  finalDurationSeconds: number;
  music?: CliprMusicMetadata;
  providerModels: string[];
  createdAt: string;
};
