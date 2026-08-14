import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingPlatformAnalyticsSummary = {
  comments: number;
  engagementRate: number;
  impressions: number;
  likes: number;
  platform: SocialPublishingPlatform;
  postCount: number;
  reach: number;
  saves: number;
  shares: number;
  views: number;
};
