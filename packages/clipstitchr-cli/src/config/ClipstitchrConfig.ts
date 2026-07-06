export type ClipstitchrConfig = {
  apiBaseUrl?: string;
  productId?: string;
  recording?: {
    durationLimitSeconds?: number;
    format?: "full-size" | "vertical";
  };
  target?: {
    start?: string;
    type?: string;
    url?: string;
  };
};
