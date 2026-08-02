import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function getPostBridgeAnalyticsCreatedAtMs(item: PostBridgeAnalytics) {
  if (typeof item.platform_created_at !== "string") {
    return null;
  }

  const timestamp = Date.parse(item.platform_created_at);

  return Number.isFinite(timestamp) ? timestamp : null;
}
