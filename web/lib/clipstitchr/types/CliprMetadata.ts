import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

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
  providerModels: string[];
  createdAt: string;
};
