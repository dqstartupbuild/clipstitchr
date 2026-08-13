import type { PublishingApiAnalyticsMetric } from "./PublishingApiAnalyticsMetric.js";

export type PublishingApiAnalyticsResponse = Readonly<{
  productId: string;
  metrics: readonly PublishingApiAnalyticsMetric[];
  observedAt: string | null;
  publications: readonly Readonly<{
    accountName: string;
    caption: string;
    id: string;
    metrics: readonly PublishingApiAnalyticsMetric[];
    observedAt: string;
    productId: string;
    provider: "instagram" | "tiktok" | "youtube";
    resultUrl: string | null;
  }>[];
  range: "7d" | "30d" | "90d";
  unsupported: readonly string[];
}>;
