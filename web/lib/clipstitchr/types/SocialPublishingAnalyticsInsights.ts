import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";
import type { SocialPublishingContentDecayBucket } from "@/lib/clipstitchr/types/SocialPublishingContentDecayBucket";
import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import type { SocialPublishingFollowerStats } from "@/lib/clipstitchr/types/SocialPublishingFollowerStats";
import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";

export type SocialPublishingAnalyticsInsights = {
  bestTimes: SocialPublishingBestTimeSlot[];
  contentDecay: SocialPublishingContentDecayBucket[];
  dailyMetrics: SocialPublishingDailyMetric[];
  followerStats: SocialPublishingFollowerStats;
  postingFrequency: SocialPublishingPostingFrequency[];
  unavailableInsights: string[];
};
