import type { AudioSample } from "mediabunny";

export function createRetimedAudioSample(
  sample: AudioSample,
  timelineOffset: number,
  sourceOffset: number,
) {
  sample.setTimestamp(Math.max(0, sample.timestamp - sourceOffset) + timelineOffset);

  return sample;
}
