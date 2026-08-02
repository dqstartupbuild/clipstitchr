import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function getLatestPostBridgeAnalyticsSyncedAtMs(
  analytics: PostBridgeAnalytics[],
) {
  let latestSyncedAtMs: number | null = null;

  for (const item of analytics) {
    const syncedAtMs = Date.parse(item.last_synced_at);

    if (!Number.isFinite(syncedAtMs)) {
      continue;
    }

    if (latestSyncedAtMs === null || syncedAtMs > latestSyncedAtMs) {
      latestSyncedAtMs = syncedAtMs;
    }
  }

  return latestSyncedAtMs;
}
