import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export type SocialPublishingAnalytics = {
  comment_count: number;
  cover_image_url: unknown;
  duration: unknown;
  id: string;
  last_synced_at: string;
  like_count: number;
  match_confidence: unknown;
  platform: SocialPublishingPlatform;
  platform_created_at: unknown;
  platform_post_id: unknown;
  post_result_id: string;
  share_count: number;
  share_url: unknown;
  video_description: unknown;
  view_count: number;
};
