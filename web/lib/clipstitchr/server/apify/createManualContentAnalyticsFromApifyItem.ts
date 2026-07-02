import { createInstagramManualContentAnalytics } from "@/lib/clipstitchr/server/apify/createInstagramManualContentAnalytics";
import { createTikTokManualContentAnalytics } from "@/lib/clipstitchr/server/apify/createTikTokManualContentAnalytics";
import { getApifyRecord } from "@/lib/clipstitchr/server/apify/getApifyRecord";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function createManualContentAnalyticsFromApifyItem(
  account: PostBridgeSocialAccount,
  item: unknown,
  syncedAt: string,
): ContentAnalytics | null {
  const record = getApifyRecord(item);

  if (!record) {
    return null;
  }

  if (account.platform === "tiktok") {
    return createTikTokManualContentAnalytics(account, record, syncedAt);
  }

  if (account.platform === "instagram") {
    return createInstagramManualContentAnalytics(account, record, syncedAt);
  }

  return null;
}
