import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type StitchMusicMetadata = {
  audioObject: R2ObjectReference;
  createdAt: string;
  durationSeconds: number;
  enabled: boolean;
  prompt: string;
  providerModel: string;
  providerPredictionId: string;
  updatedAt: string;
  volume: number;
};
