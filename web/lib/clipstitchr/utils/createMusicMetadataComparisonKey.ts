import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type ComparableMusicMetadata = {
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

export function createMusicMetadataComparisonKey(
  music: ComparableMusicMetadata | null,
) {
  if (!music) {
    return "null";
  }

  return JSON.stringify({
    audioObject: music.audioObject,
    createdAt: music.createdAt,
    durationSeconds: music.durationSeconds,
    enabled: music.enabled,
    prompt: music.prompt,
    providerModel: music.providerModel,
    providerPredictionId: music.providerPredictionId,
    sharedTrackId: music.sharedTrackId,
    tags: music.tags,
    title: music.title,
    volume: music.volume,
  });
}
