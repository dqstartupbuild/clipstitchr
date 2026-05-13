import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export function createCliprMusicMetadataFromSharedTrack(
  track: SharedMusicTrack,
): CliprMusicMetadata {
  const now = new Date().toISOString();

  return {
    audioObject: track.ownerAudioObject ?? track.audioObject,
    createdAt: now,
    durationSeconds: track.durationSeconds,
    enabled: true,
    prompt: track.prompt ?? track.title,
    providerModel: track.providerModel ?? "shared-music-library",
    providerPredictionId: track.providerPredictionId ?? track.id,
    sharedTrackId: track.id,
    tags: track.tags,
    title: track.title,
    updatedAt: now,
    volume: 1,
  };
}
