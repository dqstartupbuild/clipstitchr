import { AudioSampleSink, type AudioSampleSource, type Input } from "mediabunny";
import { createRetimedAudioSample } from "@/lib/clipr/media/createRetimedAudioSample";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipr/utils/getVideoTrimRangeDuration";

type CopyAudioSamplesOptions = {
  input: Input;
  source: AudioSampleSource;
  timelineOffset: number;
  trimRange: VideoTrimRange;
  onProgress?: (progress: number) => void;
};

type CopyAudioSamplesResult = {
  endTimestamp: number;
};

export async function copyAudioSamplesToSource({
  input,
  source,
  timelineOffset,
  trimRange,
  onProgress,
}: CopyAudioSamplesOptions): Promise<CopyAudioSamplesResult> {
  const track = await input.getPrimaryAudioTrack();

  if (!track) {
    return { endTimestamp: timelineOffset };
  }

  const sink = new AudioSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  const clampedTrimRange = clampVideoTrimRange(trimRange, duration);
  const trimDuration = getVideoTrimRangeDuration(clampedTrimRange);
  const sourceStartTimestamp = sourceOffset + clampedTrimRange.start;
  const sourceEndTimestamp = sourceOffset + clampedTrimRange.end;
  const outputEndTimestamp = timelineOffset + trimDuration;
  let endTimestamp = timelineOffset;

  for await (const sample of sink.samples(
    sourceStartTimestamp,
    sourceEndTimestamp,
  )) {
    const sourceTimestamp = sample.timestamp;
    const retimedSample = createRetimedAudioSample(
      sample,
      timelineOffset,
      sourceStartTimestamp,
    );

    try {
      if (retimedSample.timestamp >= outputEndTimestamp) {
        continue;
      }

      await source.add(retimedSample);
      endTimestamp = Math.max(
        endTimestamp,
        retimedSample.timestamp + retimedSample.duration,
      );
      onProgress?.(
        trimDuration > 0
          ? Math.min(
              1,
              Math.max(
                0,
                (sourceTimestamp - sourceStartTimestamp) / trimDuration,
              ),
            )
          : 1,
      );
    } finally {
      retimedSample.close();
    }
  }

  onProgress?.(1);

  return { endTimestamp };
}
