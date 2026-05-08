import type { VideoSample } from "mediabunny";

export function createRetimedVideoSample(
  sample: VideoSample,
  timelineOffset: number,
  sourceOffset: number,
) {
  sample.setTimestamp(Math.max(0, sample.timestamp - sourceOffset) + timelineOffset);
  sample.setRotation(0);

  return sample;
}
