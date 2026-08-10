import { getSocialPublishingScheduledAtLabel } from "@/lib/clipstitchr/utils/getSocialPublishingScheduledAtLabel";

type SocialPublishingAnalyticsSyncStatusProps = {
  isRefreshing: boolean;
  lastSyncedAt: string | null;
  stale: boolean;
};

export function SocialPublishingAnalyticsSyncStatus({
  isRefreshing,
  lastSyncedAt,
  stale,
}: SocialPublishingAnalyticsSyncStatusProps) {
  if (isRefreshing) {
    return (
      <p className="text-sm font-semibold text-text-secondary">
        Syncing latest metrics...
      </p>
    );
  }

  if (stale) {
    return (
      <p className="text-sm font-semibold text-amber-600">
        Zernio is refreshing older metrics. Check again in a little while.
      </p>
    );
  }

  if (!lastSyncedAt) {
    return null;
  }

  return (
    <p className="text-sm font-semibold text-text-secondary">
      Last synced {getSocialPublishingScheduledAtLabel(lastSyncedAt)}
    </p>
  );
}
