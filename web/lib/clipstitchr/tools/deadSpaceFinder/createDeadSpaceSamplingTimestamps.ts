import { deadSpaceAnalysisLimits } from "@/lib/clipstitchr/tools/deadSpaceFinder/deadSpaceAnalysisLimits";

export function createDeadSpaceSamplingTimestamps(
  duration: number,
  intervalSeconds: number,
) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safeInterval = Number.isFinite(intervalSeconds)
    ? Math.min(2, Math.max(0.5, intervalSeconds))
    : 0.5;
  const sampleCount = Math.min(
    deadSpaceAnalysisLimits.maxSamples,
    Math.max(1, Math.ceil(safeDuration / safeInterval)),
  );

  return Array.from({ length: sampleCount }, (_, index) =>
    Math.min(safeDuration, index * safeInterval),
  );
}
