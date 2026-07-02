import { createApifyProfileAnalyticsInput } from "@/lib/clipstitchr/server/apify/createApifyProfileAnalyticsInput";
import { createManualContentAnalyticsFromApifyItem } from "@/lib/clipstitchr/server/apify/createManualContentAnalyticsFromApifyItem";
import { getApifyProfileActorIdForPlatform } from "@/lib/clipstitchr/server/apify/getApifyProfileActorIdForPlatform";
import { runApifyActorDataset } from "@/lib/clipstitchr/server/apify/runApifyActorDataset";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import { filterManualContentAnalyticsAgainstPostBridge } from "@/lib/clipstitchr/utils/filterManualContentAnalyticsAgainstPostBridge";
import { sortContentAnalyticsByCreatedAt } from "@/lib/clipstitchr/utils/sortContentAnalyticsByCreatedAt";

type SyncManualContentAnalyticsForAccountsOptions = {
  accounts: PostBridgeSocialAccount[];
  postBridgeAnalytics: PostBridgeAnalytics[];
};

async function syncManualContentAnalyticsForAccount(
  account: PostBridgeSocialAccount,
  syncedAt: string,
) {
  const actorId = getApifyProfileActorIdForPlatform(account.platform);

  if (!actorId) {
    return [];
  }

  const items = await runApifyActorDataset({
    actorId,
    errorMessage: "Unable to sync manual posts right now.",
    input: createApifyProfileAnalyticsInput(account),
  });

  return items
    .map((item) => createManualContentAnalyticsFromApifyItem(account, item, syncedAt))
    .filter((item): item is ContentAnalytics => Boolean(item));
}

export async function syncManualContentAnalyticsForAccounts({
  accounts,
  postBridgeAnalytics,
}: SyncManualContentAnalyticsForAccountsOptions) {
  const syncedAt = new Date().toISOString();
  const manualAnalytics = (
    await Promise.all(
      accounts.map((account) =>
        syncManualContentAnalyticsForAccount(account, syncedAt),
      ),
    )
  ).flat();

  return sortContentAnalyticsByCreatedAt(
    filterManualContentAnalyticsAgainstPostBridge(
      manualAnalytics,
      postBridgeAnalytics,
    ),
  );
}
