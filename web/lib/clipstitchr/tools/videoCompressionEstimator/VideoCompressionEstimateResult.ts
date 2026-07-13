export type VideoCompressionEstimateResult = {
  bytesPerMinute: number;
  estimatedBytes: number;
  estimatedMaximumBytes: number;
  estimatedMinimumBytes: number;
  maximumReductionPercent: number | null;
  minimumReductionPercent: number | null;
  transferMaximumSeconds: number;
  transferMinimumSeconds: number;
};
