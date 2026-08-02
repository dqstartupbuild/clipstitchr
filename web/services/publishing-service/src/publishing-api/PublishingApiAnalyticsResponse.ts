import type { PublishingApiAnalyticsMetric } from "./PublishingApiAnalyticsMetric.js";

export type PublishingApiAnalyticsResponse = Readonly<{
  metrics: readonly PublishingApiAnalyticsMetric[];
  observedAt: string | null;
  publications: readonly Readonly<{
    accountName: string;
    caption: string;
    id: string;
    metrics: readonly PublishingApiAnalyticsMetric[];
    observedAt: string;
    provider: "instagram" | "tiktok";
    resultUrl: string | null;
  }>[];
  range: "7d" | "30d" | "90d";
  unsupported: readonly string[];
}>;
