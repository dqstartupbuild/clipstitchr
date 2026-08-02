import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export type PostBridgeAnalytics = {
  comment_count: number;
  cover_image_url: unknown;
  duration: unknown;
  id: string;
  last_synced_at: string;
  like_count: number;
  match_confidence: unknown;
  platform: PostBridgePlatform;
  platform_created_at: unknown;
  platform_post_id: unknown;
  post_result_id: string;
  share_count: number;
  share_url: unknown;
  video_description: unknown;
  view_count: number;
};
