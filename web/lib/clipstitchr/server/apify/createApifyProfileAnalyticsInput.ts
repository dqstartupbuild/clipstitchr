import { createInstagramProfileAnalyticsInput } from "@/lib/clipstitchr/server/apify/createInstagramProfileAnalyticsInput";
import { createTikTokProfileAnalyticsInput } from "@/lib/clipstitchr/server/apify/createTikTokProfileAnalyticsInput";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function createApifyProfileAnalyticsInput(
  account: PostBridgeSocialAccount,
) {
  if (account.platform === "tiktok") {
    return createTikTokProfileAnalyticsInput(account.username);
  }

  if (account.platform === "instagram") {
    return createInstagramProfileAnalyticsInput(account.username);
  }

  throw new Error("Manual analytics are only available for TikTok and Instagram.");
}
