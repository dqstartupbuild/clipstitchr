import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getLatestPostBridgeAnalyticsSyncedAtMs } from "./getLatestPostBridgeAnalyticsSyncedAtMs";

export function createPostBridgeAnalyticsResponse(
  analytics: PostBridgeAnalytics[],
  syncTriggered: boolean,
  stale: boolean,
) {
  const lastSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(analytics);

  return Response.json({
    analytics,
    lastSyncedAt:
      lastSyncedAtMs === null ? null : new Date(lastSyncedAtMs).toISOString(),
    stale,
    syncTriggered,
  });
}
