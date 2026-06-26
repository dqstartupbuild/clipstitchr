import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";

export function getTikTokSoundCandidateIsSaved(
  candidate: TikTokSoundCandidate,
  tracks: SharedMusicTrack[],
) {
  return tracks.some(
    (track) =>
      Boolean(candidate.musicId && track.tiktokMusicId === candidate.musicId) ||
      Boolean(candidate.sourceUrl && track.sourceUrl === candidate.sourceUrl),
  );
}
