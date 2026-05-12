import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprJobStage } from "@/lib/clipstitchr/types/CliprJobStage";
import type { CliprJobStatus } from "@/lib/clipstitchr/types/CliprJobStatus";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export type CliprClientJob = {
  id: string;
  productId: string;
  productName: string;
  avatarId: string;
  avatarPhotoId: string;
  voiceId: string;
  targetDurationSeconds: CliprDurationSeconds;
  filledHook?: string;
  script?: string;
  scenePlan: CliprScenePlan[];
  status: CliprJobStatus;
  stage: CliprJobStage;
  progress: number;
  error?: string;
  finalClipId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
