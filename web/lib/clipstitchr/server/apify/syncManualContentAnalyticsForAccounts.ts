import { createManualContentAnalyticsSyncWarning } from "@/lib/clipstitchr/server/apify/createManualContentAnalyticsSyncWarning";
import { syncManualContentAnalyticsForAccount } from "@/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccount";
import type { ManualContentAnalyticsSyncResult } from "@/lib/clipstitchr/types/ManualContentAnalyticsSyncResult";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import { filterManualContentAnalyticsAgainstPostBridge } from "@/lib/clipstitchr/utils/filterManualContentAnalyticsAgainstPostBridge";
import { sortContentAnalyticsByCreatedAt } from "@/lib/clipstitchr/utils/sortContentAnalyticsByCreatedAt";

type SyncManualContentAnalyticsForAccountsOptions = {
  accounts: PostBridgeSocialAccount[];
  postBridgeAnalytics: PostBridgeAnalytics[];
};

export async function syncManualContentAnalyticsForAccounts({
  accounts,
  postBridgeAnalytics,
}: SyncManualContentAnalyticsForAccountsOptions): Promise<ManualContentAnalyticsSyncResult> {
  const syncedAt = new Date().toISOString();
  const accountResults =
    await Promise.all(
      accounts.map((account) =>
        syncManualContentAnalyticsForAccount(account, syncedAt),
      ),
    );
  const failedAccountCount = accountResults.reduce(
    (total, result) => total + result.failedAccountCount,
    0,
  );
  const skippedItemCount = accountResults.reduce(
    (total, result) => total + result.skippedItemCount,
    0,
  );
  const manualAnalytics = accountResults.flatMap((result) => result.analytics);
  const analytics = sortContentAnalyticsByCreatedAt(
    filterManualContentAnalyticsAgainstPostBridge(
      manualAnalytics,
      postBridgeAnalytics,
    ),
  );

  return {
    analytics,
    failedAccountCount,
    skippedItemCount,
    warning: createManualContentAnalyticsSyncWarning({
      failedAccountCount,
      skippedItemCount,
    }),
  };
}
