import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";
import type { DeadSpaceSample } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSample";
import type { DeadSpaceSpan } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSpan";

export function createDeadSpaceSpans(
  samples: readonly DeadSpaceSample[],
  options: DeadSpaceAnalysisOptions,
) {
  const spans: DeadSpaceSpan[] = [];
  let candidate: DeadSpaceSample[] = [];

  const flush = () => {
    if (!candidate.length) return;
    const start = candidate[0].timestamp;
    const end = candidate.at(-1)!.timestamp + options.sampleIntervalSeconds;
    const duration = end - start;

    if (duration >= options.minimumSpanSeconds) {
      const audioValues = candidate.flatMap((sample) =>
        sample.audioRms === null ? [] : [sample.audioRms],
      );

      spans.push({
        averageAudioRms: audioValues.length
          ? audioValues.reduce((total, value) => total + value, 0) /
            audioValues.length
          : null,
        averageVisualChange:
          candidate.reduce((total, sample) => total + sample.visualChange, 0) /
          candidate.length,
        duration,
        end,
        start,
      });
    }

    candidate = [];
  };

  for (const sample of samples) {
    const isQuiet =
      sample.audioRms === null || sample.audioRms <= options.audioThreshold;
    const isStill = sample.visualChange <= options.visualThreshold;

    if (isQuiet && isStill) candidate.push(sample);
    else flush();
  }

  flush();
  return spans;
}
