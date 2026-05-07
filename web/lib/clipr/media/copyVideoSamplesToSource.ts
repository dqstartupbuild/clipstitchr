import { VideoSampleSink, type Input, type VideoSampleSource } from "mediabunny";
import { createRetimedVideoSample } from "@/lib/clipr/media/createRetimedVideoSample";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipr/utils/getVideoTrimRangeDuration";

type CopyVideoSamplesOptions = {
  input: Input;
  source: VideoSampleSource;
  timelineOffset: number;
  trimRange: VideoTrimRange;
  onProgress?: (progress: number) => void;
};

type CopyVideoSamplesResult = {
  endTimestamp: number;
};

export async function copyVideoSamplesToSource({
  input,
  source,
  timelineOffset,
  trimRange,
  onProgress,
}: CopyVideoSamplesOptions): Promise<CopyVideoSamplesResult> {
  const track = await input.getPrimaryVideoTrack();

  if (!track) {
    throw new Error("A normalized clip was missing its video track.");
  }

  const sink = new VideoSampleSink(track);
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  const clampedTrimRange = clampVideoTrimRange(trimRange, duration);
  const trimDuration = getVideoTrimRangeDuration(clampedTrimRange);
  const sourceStartTimestamp = sourceOffset + clampedTrimRange.start;
  const sourceEndTimestamp = sourceOffset + clampedTrimRange.end;
  const outputEndTimestamp = timelineOffset + trimDuration;
  let isFirstSample = true;
  let endTimestamp = timelineOffset;

  for await (const sample of sink.samples(
    sourceStartTimestamp,
    sourceEndTimestamp,
  )) {
    const sourceTimestamp = sample.timestamp;
    const retimedSample = createRetimedVideoSample(
      sample,
      timelineOffset,
      sourceStartTimestamp,
    );

    try {
      const remainingDuration = outputEndTimestamp - retimedSample.timestamp;

      if (remainingDuration <= 0) {
        continue;
      }

      if (retimedSample.duration > remainingDuration) {
        retimedSample.setDuration(remainingDuration);
      }

      await source.add(
        retimedSample,
        isFirstSample ? { keyFrame: true } : undefined,
      );
      isFirstSample = false;
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
