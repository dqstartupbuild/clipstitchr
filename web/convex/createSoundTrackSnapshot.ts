import type { Doc } from "./_generated/dataModel";

export function createSoundTrackSnapshot(track: Doc<"sharedMusicTracks">) {
  return {
    id: track.id,
    title: track.title,
    tags: track.tags,
    style: track.style,
    durationSeconds: track.durationSeconds,
    audioObject: track.ownerAudioObject ?? track.audioObject,
    ownerAudioObject: track.ownerAudioObject,
    mimeType: track.mimeType,
    size: track.size,
    prompt: track.prompt,
    providerModel: track.providerModel,
    providerPredictionId: track.providerPredictionId,
    source: track.source,
    sourceUrl: track.sourceUrl,
    tiktokMusicId: track.tiktokMusicId,
    uploadedByOwnerId: track.uploadedByOwnerId,
    isOwnedByCurrentUser: true,
    createdAt: track.createdAt,
  };
}
