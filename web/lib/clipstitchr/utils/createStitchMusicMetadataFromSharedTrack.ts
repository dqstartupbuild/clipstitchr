import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";

export function createStitchMusicMetadataFromSharedTrack(
  track: SharedMusicTrack,
): StitchMusicMetadata {
  const now = new Date().toISOString();

  return {
    audioObject: track.ownerAudioObject ?? track.audioObject,
    createdAt: now,
    durationSeconds: track.durationSeconds,
    enabled: true,
    prompt: track.prompt ?? track.title,
    providerModel: track.providerModel ?? "private-sound-vault",
    providerPredictionId: track.providerPredictionId ?? track.id,
    sharedTrackId: track.id,
    sourceUrl: track.sourceUrl,
    tags: track.tags,
    tiktokMusicId: track.tiktokMusicId,
    title: track.title,
    updatedAt: now,
    volume: 1,
  };
}
