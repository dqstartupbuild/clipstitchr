import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getSharedMusicTrackCreatedAtMs } from "@/lib/clipstitchr/utils/getSharedMusicTrackCreatedAtMs";
import { scoreSharedMusicTrackForQuery } from "@/lib/clipstitchr/utils/scoreSharedMusicTrackForQuery";

export function selectAutomaticSharedMusicTrack(
  tracks: SharedMusicTrack[],
  query: string,
) {
  return (
    tracks
      .map((track) => ({
        createdAtMs: getSharedMusicTrackCreatedAtMs(track),
        score: scoreSharedMusicTrackForQuery(track, query),
        track,
      }))
      .sort(
        (left, right) =>
          right.score - left.score || right.createdAtMs - left.createdAtMs,
      )[0]?.track ?? null
  );
}
