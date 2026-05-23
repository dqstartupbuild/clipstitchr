import type { VideoSample } from "mediabunny";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";

export function createRetimedVideoSample(
  sample: VideoSample,
  timelineOffset: number,
  sourceOffset: number,
  playbackRate: VideoPlaybackRate = 1,
) {
  sample.setTimestamp(
    Math.max(0, sample.timestamp - sourceOffset) / playbackRate +
      timelineOffset,
  );
  sample.setDuration(sample.duration / playbackRate);
  sample.setRotation(0);

  return sample;
}
