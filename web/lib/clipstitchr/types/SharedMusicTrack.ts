import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type SharedMusicTrack = {
  id: string;
  title: string;
  tags: string[];
  style?: string;
  durationSeconds: number;
  audioObject: R2ObjectReference;
  ownerAudioObject?: R2ObjectReference;
  mimeType: string;
  size: number;
  prompt?: string;
  providerModel?: string;
  providerPredictionId?: string;
  sourceUrl?: string;
  source: MusicTrackSource;
  tiktokMusicId?: string;
  uploadedByOwnerId: string;
  isOwnedByCurrentUser: boolean;
  createdAt: string;
};
