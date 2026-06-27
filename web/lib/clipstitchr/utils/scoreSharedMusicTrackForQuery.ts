import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getAutomaticSoundSearchTokens } from "@/lib/clipstitchr/utils/getAutomaticSoundSearchTokens";
import { getSharedMusicTrackSearchText } from "@/lib/clipstitchr/utils/getSharedMusicTrackSearchText";

export function scoreSharedMusicTrackForQuery(
  track: SharedMusicTrack,
  query: string,
) {
  const searchText = getSharedMusicTrackSearchText(track);
  const tokenScore = getAutomaticSoundSearchTokens(query).reduce(
    (score, token) => score + (searchText.includes(token) ? 1 : 0),
    0,
  );
  const sourceScore = track.source === "tiktok" ? 2 : 0;

  return tokenScore + sourceScore;
}
