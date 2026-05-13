import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type CliprMusicMetadata = {
  audioObject: R2ObjectReference;
  createdAt: string;
  durationSeconds: number;
  enabled: boolean;
  prompt: string;
  providerModel: string;
  providerPredictionId: string;
  sharedTrackId?: string;
  tags?: string[];
  title?: string;
  updatedAt: string;
  volume: number;
};
