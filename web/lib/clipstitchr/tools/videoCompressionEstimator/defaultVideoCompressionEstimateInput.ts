import type { VideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/VideoCompressionEstimateInput";

export const defaultVideoCompressionEstimateInput: VideoCompressionEstimateInput =
  {
    audioBitrateKbps: 128,
    durationSeconds: 30,
    originalBytes: 48_000_000,
    uploadMegabitsPerSecond: 10,
    videoBitrateKbps: 4_000,
  };
