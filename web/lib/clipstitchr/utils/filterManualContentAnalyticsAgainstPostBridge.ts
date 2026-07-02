import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsDedupeKeys } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsDedupeKeys";
import { getPostBridgeAnalyticsDedupeKeySet } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsDedupeKeySet";

export function filterManualContentAnalyticsAgainstPostBridge(
  manualAnalytics: ContentAnalytics[],
  postBridgeAnalytics: PostBridgeAnalytics[],
) {
  const postBridgeKeys = getPostBridgeAnalyticsDedupeKeySet(postBridgeAnalytics);

  return manualAnalytics.filter((item) =>
    getPostBridgeAnalyticsDedupeKeys(item).every(
      (key) => !postBridgeKeys.has(key),
    ),
  );
}
