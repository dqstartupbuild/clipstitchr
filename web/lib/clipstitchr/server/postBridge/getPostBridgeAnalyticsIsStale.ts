import { postBridgeAnalyticsStaleThresholdMs } from "@/lib/clipstitchr/constants/postBridgeAnalyticsStaleThresholdMs";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getLatestPostBridgeAnalyticsSyncedAtMs } from "./getLatestPostBridgeAnalyticsSyncedAtMs";

export function getPostBridgeAnalyticsIsStale(
  analytics: PostBridgeAnalytics[],
  hasPostResults: boolean,
) {
  if (!hasPostResults) {
    return false;
  }

  const lastSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(analytics);

  return (
    lastSyncedAtMs === null ||
    Date.now() - lastSyncedAtMs > postBridgeAnalyticsStaleThresholdMs
  );
}
