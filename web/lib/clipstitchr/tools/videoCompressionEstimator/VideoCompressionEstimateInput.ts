export type VideoCompressionEstimateInput = {
  durationSeconds: number;
  originalBytes: number | null;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  uploadMegabitsPerSecond: number;
};
