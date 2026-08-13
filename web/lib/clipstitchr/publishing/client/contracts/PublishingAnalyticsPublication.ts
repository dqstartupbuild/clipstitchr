import type { PublishingAnalyticsMetric } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsMetric";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export type PublishingAnalyticsPublication = {
  accountName: string;
  caption: string;
  id: string;
  metrics: PublishingAnalyticsMetric[];
  observedAt: string;
  productId: string;
  provider: PublishingProvider;
  resultUrl: string | null;
};
