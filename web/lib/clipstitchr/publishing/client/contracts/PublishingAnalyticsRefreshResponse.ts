import type { PublishingAnalyticsMetric } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsMetric";

export type PublishingAnalyticsRefreshResponse = {
  metrics: PublishingAnalyticsMetric[];
  observedAt: string;
  postId: string;
};
