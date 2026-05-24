import type { CliprCompositionStrategy } from "@/lib/clipstitchr/types/CliprCompositionStrategy";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export type CliprMetadata = {
  jobId: string;
  productId: string;
  productName: string;
  contentType?: CliprContentType;
  compositionStrategy?: CliprCompositionStrategy;
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
  textOverlay?: TextOverlay;
  providerModels: string[];
  createdAt: string;
};
