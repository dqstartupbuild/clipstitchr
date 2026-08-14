import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";
import type { SocialPublishingContentDecayBucket } from "@/lib/clipstitchr/types/SocialPublishingContentDecayBucket";
import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import type { SocialPublishingFollowerStats } from "@/lib/clipstitchr/types/SocialPublishingFollowerStats";
import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";

export type SocialPublishingAnalyticsLoadResult = {
  accountCount: number;
  analytics: SocialPublishingAnalytics[];
  bestTimes: SocialPublishingBestTimeSlot[];
  contentDecay: SocialPublishingContentDecayBucket[];
  dailyMetrics: SocialPublishingDailyMetric[];
  externalSyncFailedAccountCount: number;
  followerStats: SocialPublishingFollowerStats;
  lastSyncedAt: string | null;
  postingFrequency: SocialPublishingPostingFrequency[];
  stale: boolean;
  unavailableInsights: string[];
};
