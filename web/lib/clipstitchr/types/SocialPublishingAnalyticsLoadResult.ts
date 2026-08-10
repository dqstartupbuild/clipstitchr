import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export type SocialPublishingAnalyticsLoadResult = {
  analytics: SocialPublishingAnalytics[];
  lastSyncedAt: string | null;
  stale: boolean;
};
