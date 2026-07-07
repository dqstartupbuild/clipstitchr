export type ClipstitchrConfig = {
  apiBaseUrl?: string;
  productId?: string;
  recording?: {
    demoGuideId?: string;
    durationLimitSeconds?: number;
    format?: "full-size" | "vertical";
    longRecordingWarningSeconds?: number;
    recommendedDurationSeconds?: number;
  };
  target?: {
    start?: string;
    type?: string;
    url?: string;
  };
};
