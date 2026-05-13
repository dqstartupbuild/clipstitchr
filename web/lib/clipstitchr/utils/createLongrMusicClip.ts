import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { clampLongrMusicClip } from "@/lib/clipstitchr/utils/clampLongrMusicClip";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateLongrMusicClipOptions = {
  timelineDurationSeconds: number;
  timelineStartSeconds?: number;
  track: SharedMusicTrack;
};

export function createLongrMusicClip({
  timelineDurationSeconds,
  timelineStartSeconds = 0,
  track,
}: CreateLongrMusicClipOptions): LongrMusicClip {
  return clampLongrMusicClip({
    clip: {
      id: createId(),
      trackId: track.id,
      trackTitle: track.title,
      durationSeconds: track.durationSeconds,
      sourceStartSeconds: 0,
      sourceEndSeconds: Math.min(track.durationSeconds, timelineDurationSeconds),
      timelineStartSeconds,
      volume: 0.8,
    },
    timelineDurationSeconds,
  });
}
