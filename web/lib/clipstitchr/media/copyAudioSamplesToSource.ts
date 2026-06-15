import { AudioSampleSink, type AudioSampleSource, type Input } from "mediabunny";
import { createRetimedAudioSample } from "@/lib/clipstitchr/media/createRetimedAudioSample";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CopyAudioSamplesOptions = {
  input: Input;
  source: AudioSampleSource;
  timelineOffset: number;
  trimRange: VideoTrimRange;
  removeRanges?: QuickEditRemoveRange[];
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
  removeRanges = [],
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
  const playableRanges = getQuickEditPlayableRanges(
    clampedTrimRange,
    duration,
    removeRanges,
  );
  const trimDuration = playableRanges.reduce(
    (total, range) => total + getVideoTrimRangeDuration(range),
    0,
  );
  let endTimestamp = timelineOffset;
  let outputOffset = timelineOffset;
  let sourceProgressDuration = 0;

  for (const playableRange of playableRanges) {
    const sourceStartTimestamp = sourceOffset + playableRange.start;
    const sourceEndTimestamp = sourceOffset + playableRange.end;
    const outputEndTimestamp =
      outputOffset + getVideoTrimRangeDuration(playableRange);

    for await (const sample of sink.samples(
      sourceStartTimestamp,
      sourceEndTimestamp,
    )) {
      const sourceTimestamp = sample.timestamp;
      const retimedSample = createRetimedAudioSample(
        sample,
        outputOffset,
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
                  (sourceProgressDuration +
                    sourceTimestamp -
                    sourceStartTimestamp) /
                    trimDuration,
                ),
              )
            : 1,
        );
      } finally {
        retimedSample.close();
      }
    }

    sourceProgressDuration += getVideoTrimRangeDuration(playableRange);
    outputOffset = outputEndTimestamp;
  }

  onProgress?.(1);

  return { endTimestamp };
}
