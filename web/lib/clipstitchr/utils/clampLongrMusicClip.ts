import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

type ClampLongrMusicClipOptions = {
  clip: LongrMusicClip;
  timelineDurationSeconds: number;
};

export function clampLongrMusicClip({
  clip,
  timelineDurationSeconds,
}: ClampLongrMusicClipOptions): LongrMusicClip {
  const durationSeconds = Math.max(0.1, clip.durationSeconds);
  const sourceStartSeconds = clamp(
    clip.sourceStartSeconds,
    0,
    Math.max(0, durationSeconds - 0.1),
  );
  const sourceEndSeconds = clamp(
    Math.max(sourceStartSeconds + 0.1, clip.sourceEndSeconds),
    sourceStartSeconds + 0.1,
    durationSeconds,
  );

  return {
    ...clip,
    durationSeconds,
    sourceStartSeconds,
    sourceEndSeconds,
    timelineStartSeconds: clamp(
      clip.timelineStartSeconds,
      0,
      Math.max(0, timelineDurationSeconds),
    ),
    volume: clamp(clip.volume, 0, 1),
  };
}
