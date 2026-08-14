import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingPostingFrequency = {
  averageEngagement: number;
  averageEngagementRate: number;
  platform: SocialPublishingPlatform;
  postsPerWeek: number;
  weeksCount: number;
};
