import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsDedupeKeys } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsDedupeKeys";

export function getPostBridgeAnalyticsDedupeKeySet(
  analytics: PostBridgeAnalytics[],
) {
  return new Set(analytics.flatMap(getPostBridgeAnalyticsDedupeKeys));
}
