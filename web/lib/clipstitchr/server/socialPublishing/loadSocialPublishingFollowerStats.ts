import { getSocialPublishingAnalyticsNumber } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsNumber";
import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type {
  SocialPublishingFollowerAccount,
  SocialPublishingFollowerPoint,
  SocialPublishingFollowerStats,
} from "@/lib/clipstitchr/types/SocialPublishingFollowerStats";

type ZernioFollowerAccount = {
  _id?: unknown;
  accountId?: unknown;
  currentFollowers?: unknown;
  growth?: unknown;
  growthPercentage?: unknown;
  platform?: unknown;
  username?: unknown;
};

type ZernioFollowerPoint = {
  date?: unknown;
  followers?: unknown;
};

type ZernioFollowerStatsResponse = {
  accounts?: ZernioFollowerAccount[];
  stats?: Record<string, ZernioFollowerPoint[]>;
};

export async function loadSocialPublishingFollowerStats(
  apiKey: string,
  accountIds: string[],
): Promise<SocialPublishingFollowerStats> {
  const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const response =
    await requestSocialPublishing<ZernioFollowerStatsResponse>(
      "/v1/accounts/follower-stats",
      {
        apiKey,
        query: new URLSearchParams({
          accountIds: accountIds.join(","),
          fromDate,
          granularity: "daily",
        }),
      },
    );
  const accounts = (response.accounts ?? []).flatMap(
    (account): SocialPublishingFollowerAccount[] => {
      const accountId = account.accountId ?? account._id;

      if (
        typeof accountId !== "string" ||
        !isSocialPublishingPlatform(account.platform)
      ) {
        return [];
      }

      return [
        {
          accountId,
          currentFollowers: getSocialPublishingAnalyticsNumber(
            account.currentFollowers,
          ),
          growth: getSocialPublishingAnalyticsNumber(account.growth),
          growthPercentage: getSocialPublishingAnalyticsNumber(
            account.growthPercentage,
          ),
          platform: account.platform,
          username:
            typeof account.username === "string" && account.username
              ? account.username
              : "Connected account",
        },
      ];
    },
  );
  const historyByAccountId = Object.fromEntries(
    Object.entries(response.stats ?? {}).map(([accountId, points]) => [
      accountId,
      points.flatMap((point): SocialPublishingFollowerPoint[] =>
        typeof point.date === "string"
          ? [
              {
                date: point.date,
                followers: getSocialPublishingAnalyticsNumber(point.followers),
              },
            ]
          : [],
      ),
    ]),
  );

  return { accounts, historyByAccountId };
}
