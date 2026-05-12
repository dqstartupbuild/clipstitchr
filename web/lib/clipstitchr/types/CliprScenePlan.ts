import type { CliprSceneType } from "@/lib/clipstitchr/types/CliprSceneType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type CliprScenePlan = {
  id: string;
  index: number;
  sceneType: CliprSceneType;
  scriptText: string;
  visualPrompt: string;
  photoScript?: string;
  estimatedDurationSeconds: number;
  voiceAudioObject?: R2ObjectReference;
  generatedImageObject?: R2ObjectReference;
  generatedVideoObject?: R2ObjectReference;
  providerImagePredictionId?: string;
  providerPredictionId?: string;
};
