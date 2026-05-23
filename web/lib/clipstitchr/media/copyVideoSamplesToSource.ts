import { VideoSampleSink, type Input, type VideoSampleSource } from "mediabunny";
import { createRetimedVideoSample } from "@/lib/clipstitchr/media/createRetimedVideoSample";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CopyVideoSamplesOptions = {
  input: Input;
  playbackRate?: VideoPlaybackRate;
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
  playbackRate = 1,
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
  const outputDuration = getPlaybackRateDuration(
    clampedTrimRange,
    playbackRate,
  );
  const sourceStartTimestamp = sourceOffset + clampedTrimRange.start;
  const sourceEndTimestamp = sourceOffset + clampedTrimRange.end;
  const outputEndTimestamp = timelineOffset + outputDuration;
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
      playbackRate,
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
