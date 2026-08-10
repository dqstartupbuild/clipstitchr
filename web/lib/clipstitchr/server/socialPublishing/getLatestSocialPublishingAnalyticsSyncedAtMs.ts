import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function getLatestSocialPublishingAnalyticsSyncedAtMs(
  analytics: SocialPublishingAnalytics[],
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
