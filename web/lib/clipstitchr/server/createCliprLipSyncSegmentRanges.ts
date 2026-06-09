type CreateCliprLipSyncSegmentRangesOptions = {
  maximumSegmentSeconds?: number;
  minimumSegmentSeconds?: number;
  segmentSeconds: number;
  totalDurationSeconds: number;
};

export function createCliprLipSyncSegmentRanges({
  maximumSegmentSeconds,
  minimumSegmentSeconds = 0,
  segmentSeconds,
  totalDurationSeconds,
}: CreateCliprLipSyncSegmentRangesOptions) {
  const duration = Math.max(0, totalDurationSeconds);
  const maximumDurationSeconds = maximumSegmentSeconds ?? segmentSeconds;
  const ranges: Array<{ durationSeconds: number; index: number; startSeconds: number }> =
    [];
  let startSeconds = 0;

  while (startSeconds < duration - 0.001) {
    const remainingSeconds = duration - startSeconds;
    const rangeDurationSeconds = Math.min(segmentSeconds, remainingSeconds);

    ranges.push({
      durationSeconds: rangeDurationSeconds,
      index: ranges.length,
      startSeconds,
    });
    startSeconds += rangeDurationSeconds;
  }

  const lastRange = ranges.at(-1);
  const previousRange = ranges.at(-2);

  if (
    lastRange &&
    previousRange &&
    lastRange.durationSeconds < minimumSegmentSeconds &&
    previousRange.durationSeconds + lastRange.durationSeconds <=
      maximumDurationSeconds
  ) {
    previousRange.durationSeconds += lastRange.durationSeconds;
    ranges.pop();
  }

  return ranges;
}
