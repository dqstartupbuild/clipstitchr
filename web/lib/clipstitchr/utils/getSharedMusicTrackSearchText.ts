import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export function getSharedMusicTrackSearchText(track: SharedMusicTrack) {
  return [
    track.title,
    track.style,
    track.prompt,
    track.source,
    track.sourceUrl,
    track.tiktokMusicId,
    ...track.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
