import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";
import type { VideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateInput";
import type { VideoCompressionEstimateResult } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateResult";
import { videoCompressionEstimateLimits } from "@/lib/clipstitchr/tools/videoCompressionEstimator/videoCompressionEstimateLimits";

const ESTIMATE_VARIANCE = 0.08;

export function calculateVideoCompressionEstimate(
  input: VideoCompressionEstimateInput,
): VideoCompressionEstimateResult {
  const durationSeconds = normalizeBoundedDecimal(
    input.durationSeconds,
    videoCompressionEstimateLimits.durationSeconds,
  );
  const videoBitrateKbps = normalizeBoundedDecimal(
    input.videoBitrateKbps,
    videoCompressionEstimateLimits.videoBitrateKbps,
  );
  const audioBitrateKbps = normalizeBoundedDecimal(
    input.audioBitrateKbps,
    videoCompressionEstimateLimits.audioBitrateKbps,
  );
  const uploadMegabitsPerSecond = normalizeBoundedDecimal(
    input.uploadMegabitsPerSecond,
    videoCompressionEstimateLimits.uploadMegabitsPerSecond,
  );
  const originalBytes =
    input.originalBytes === null
      ? null
      : normalizeBoundedDecimal(
          input.originalBytes,
          videoCompressionEstimateLimits.originalBytes,
        );
  const combinedBitrateKbps = videoBitrateKbps + audioBitrateKbps;
  const estimatedBytes = (durationSeconds * combinedBitrateKbps * 1_000) / 8;
  const estimatedMinimumBytes = estimatedBytes * (1 - ESTIMATE_VARIANCE);
  const estimatedMaximumBytes = estimatedBytes * (1 + ESTIMATE_VARIANCE);
  const transferDivisor = uploadMegabitsPerSecond * 1_000_000;

  return {
    bytesPerMinute: (combinedBitrateKbps * 1_000 * 60) / 8,
    estimatedBytes,
    estimatedMaximumBytes,
    estimatedMinimumBytes,
    maximumReductionPercent:
      originalBytes && originalBytes > 0
        ? ((originalBytes - estimatedMinimumBytes) / originalBytes) * 100
        : null,
    minimumReductionPercent:
      originalBytes && originalBytes > 0
        ? ((originalBytes - estimatedMaximumBytes) / originalBytes) * 100
        : null,
    transferMaximumSeconds:
      transferDivisor > 0 ? (estimatedMaximumBytes * 8) / transferDivisor : 0,
    transferMinimumSeconds:
      transferDivisor > 0 ? (estimatedMinimumBytes * 8) / transferDivisor : 0,
  };
}
