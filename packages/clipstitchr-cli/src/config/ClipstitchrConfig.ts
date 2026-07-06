export type ClipstitchrConfig = {
  apiBaseUrl?: string;
  productId?: string;
  recording?: {
    durationLimitSeconds?: number;
    format?: "vertical";
  };
  target?: {
    start?: string;
    type?: string;
    url?: string;
  };
};
