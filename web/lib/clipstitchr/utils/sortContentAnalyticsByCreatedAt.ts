import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import { getPostBridgeAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs";

function getContentAnalyticsSortMs(item: ContentAnalytics) {
  const createdAtMs = getPostBridgeAnalyticsCreatedAtMs(item);

  if (createdAtMs !== null) {
    return createdAtMs;
  }

  const syncedAtMs = Date.parse(item.last_synced_at);

  return Number.isFinite(syncedAtMs) ? syncedAtMs : 0;
}

export function sortContentAnalyticsByCreatedAt(analytics: ContentAnalytics[]) {
  return [...analytics].sort(
    (first, second) =>
      getContentAnalyticsSortMs(second) - getContentAnalyticsSortMs(first),
  );
}
