import type { PublishingAnalyticsMetric } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsMetric";
import type { PublishingAnalyticsPublication } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsPublication";

export type PublishingAnalyticsResponse = {
  metrics: PublishingAnalyticsMetric[];
  observedAt: string | null;
  publications: PublishingAnalyticsPublication[];
  range: "30d" | "7d" | "90d";
  unsupported: string[];
};
