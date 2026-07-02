import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import { getPostBridgeAnalyticsDedupeKeys } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsDedupeKeys";
import { getPostBridgeAnalyticsDedupeKeySet } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsDedupeKeySet";
import { sortContentAnalyticsByCreatedAt } from "@/lib/clipstitchr/utils/sortContentAnalyticsByCreatedAt";

type MergeSyncedContentAnalyticsOptions = {
  currentAnalytics: ContentAnalytics[];
  keepCurrentManualAnalytics: boolean;
  syncedAnalytics: ContentAnalytics[];
};

export function mergeSyncedContentAnalytics({
  currentAnalytics,
  keepCurrentManualAnalytics,
  syncedAnalytics,
}: MergeSyncedContentAnalyticsOptions) {
  if (!keepCurrentManualAnalytics) {
    return sortContentAnalyticsByCreatedAt(syncedAnalytics);
  }

  const syncedPostBridgeAnalytics = syncedAnalytics.filter(
    (item) => item.analytics_source === "post_bridge",
  );
  const syncedManualAnalytics = syncedAnalytics.filter(
    (item) => item.analytics_source === "manual",
  );
  const syncedIds = new Set(syncedAnalytics.map((item) => item.id));
  const syncedDedupeKeys = getPostBridgeAnalyticsDedupeKeySet(syncedAnalytics);
  const currentManualAnalytics = currentAnalytics.filter((item) => {
    if (item.analytics_source !== "manual" || syncedIds.has(item.id)) {
      return false;
    }

    return getPostBridgeAnalyticsDedupeKeys(item).every(
      (key) => !syncedDedupeKeys.has(key),
    );
  });

  return sortContentAnalyticsByCreatedAt([
    ...syncedPostBridgeAnalytics,
    ...syncedManualAnalytics,
    ...currentManualAnalytics,
  ]);
}
