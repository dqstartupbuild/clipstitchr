import { getPostBridgeScheduledAtLabel } from "@/lib/clipstitchr/utils/getPostBridgeScheduledAtLabel";

type PostBridgeAnalyticsSyncStatusProps = {
  lastSyncedAt: string | null;
  stale: boolean;
  syncTriggered: boolean;
};

export function PostBridgeAnalyticsSyncStatus({
  lastSyncedAt,
  stale,
  syncTriggered,
}: PostBridgeAnalyticsSyncStatusProps) {
  if (syncTriggered) {
    return (
      <p className="text-sm font-semibold text-text-secondary">
        Syncing latest metrics…
      </p>
    );
  }

  if (stale) {
    return (
      <p className="text-sm font-semibold text-amber-600">
        Metrics may be outdated — automatic sync is temporarily rate-limited.
      </p>
    );
  }

  if (!lastSyncedAt) {
    return null;
  }

  return (
    <p className="text-sm font-semibold text-text-secondary">
      Last synced {getPostBridgeScheduledAtLabel(lastSyncedAt)}
    </p>
  );
}
