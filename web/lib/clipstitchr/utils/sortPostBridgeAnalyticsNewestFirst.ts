import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs";

export function sortPostBridgeAnalyticsNewestFirst(
  analytics: PostBridgeAnalytics[],
) {
  return [...analytics].sort((left, right) => {
    const leftTime = getPostBridgeAnalyticsCreatedAtMs(left);
    const rightTime = getPostBridgeAnalyticsCreatedAtMs(right);

    if (leftTime === null) {
      return rightTime === null ? 0 : 1;
    }

    return rightTime === null ? -1 : rightTime - leftTime;
  });
}
