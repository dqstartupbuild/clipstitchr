import { createApifyProfileAnalyticsInput } from "@/lib/clipstitchr/server/apify/createApifyProfileAnalyticsInput";
import { createManualContentAnalyticsFromApifyItem } from "@/lib/clipstitchr/server/apify/createManualContentAnalyticsFromApifyItem";
import { getApifyProfileActorIdForPlatform } from "@/lib/clipstitchr/server/apify/getApifyProfileActorIdForPlatform";
import { runApifyActorDataset } from "@/lib/clipstitchr/server/apify/runApifyActorDataset";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { ManualContentAnalyticsAccountSyncResult } from "@/lib/clipstitchr/types/ManualContentAnalyticsAccountSyncResult";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export async function syncManualContentAnalyticsForAccount(
  account: PostBridgeSocialAccount,
  syncedAt: string,
): Promise<ManualContentAnalyticsAccountSyncResult> {
  try {
    const actorId = getApifyProfileActorIdForPlatform(account.platform);

    if (!actorId) {
      return {
        analytics: [],
        failedAccountCount: 0,
        skippedItemCount: 0,
      };
    }

    const items = await runApifyActorDataset({
      actorId,
      errorMessage: "Unable to sync manual posts right now.",
      input: createApifyProfileAnalyticsInput(account),
    });
    const analytics: ContentAnalytics[] = [];
    let skippedItemCount = 0;

    for (const item of items) {
      try {
        const analyticsItem = createManualContentAnalyticsFromApifyItem(
          account,
          item,
          syncedAt,
        );

        if (analyticsItem) {
          analytics.push(analyticsItem);
        } else {
          skippedItemCount += 1;
        }
      } catch {
        skippedItemCount += 1;
      }
    }

    return {
      analytics,
      failedAccountCount: 0,
      skippedItemCount,
    };
  } catch {
    return {
      analytics: [],
      failedAccountCount: 1,
      skippedItemCount: 0,
    };
  }
}
