import type { ContentAnalyticsSource } from "@/lib/clipstitchr/types/ContentAnalyticsSource";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export type ContentAnalytics = PostBridgeAnalytics & {
  account_username?: string;
  analytics_source: ContentAnalyticsSource;
};
