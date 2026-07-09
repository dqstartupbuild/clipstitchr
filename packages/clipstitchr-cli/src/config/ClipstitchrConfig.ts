export type ClipstitchrConfig = {
  apiBaseUrl?: string;
  appContext?: {
    generatedAt?: string;
    path?: string;
    routeCount?: number;
    workflowHintCount?: number;
  };
  demoAgent?: {
    driver?: string;
    liveUrl?: string;
    openai?: {
      mode?: string;
      model?: string;
    };
    macosWindowMatch?: string;
    surface?: string;
    target?: string;
  };
  product?: {
    id?: string;
    name?: string;
    updatedAt?: string;
    websiteUrl?: string;
  };
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
