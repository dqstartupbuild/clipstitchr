import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export function getSharedMusicTrackCreatedAtMs(track: SharedMusicTrack) {
  const createdAtMs = Date.parse(track.createdAt);

  return Number.isFinite(createdAtMs) ? createdAtMs : 0;
}
