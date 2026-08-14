import { createSocialPublishingAnalyticsQuery } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingAnalyticsQuery";
import { getSocialPublishingAnalyticsNumber } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsNumber";
import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";
import type { SocialPublishingPostingFrequency } from "@/lib/clipstitchr/types/SocialPublishingPostingFrequency";

type ZernioPostingFrequency = {
  avg_engagement?: unknown;
  avg_engagement_rate?: unknown;
  averageEngagement?: unknown;
  averageEngagementRate?: unknown;
  platform?: unknown;
  postsPerWeek?: unknown;
  posts_per_week?: unknown;
  weeksCount?: unknown;
  weeks_count?: unknown;
};

type ZernioPostingFrequencyResponse = {
  frequency?: ZernioPostingFrequency[];
};

export async function loadSocialPublishingPostingFrequency(
  apiKey: string,
  scopes: SocialPublishingAnalyticsQueryScope[],
) {
  const responses = await Promise.all(
    scopes.map((scope) =>
      requestSocialPublishing<ZernioPostingFrequencyResponse>(
        "/v1/analytics/posting-frequency",
        {
          apiKey,
          query: createSocialPublishingAnalyticsQuery(scope),
        },
      ),
    ),
  );
  const rowsByFrequency = new Map<
    string,
    SocialPublishingPostingFrequency & {
      weightedEngagement: number;
      weightedEngagementRate: number;
    }
  >();

  responses.forEach((response) => {
    (response.frequency ?? []).forEach((row) => {
      if (!isSocialPublishingPlatform(row.platform)) {
        return;
      }

      const postsPerWeek = getSocialPublishingAnalyticsNumber(
        row.postsPerWeek ?? row.posts_per_week,
      );
      const weeksCount = getSocialPublishingAnalyticsNumber(
        row.weeksCount ?? row.weeks_count,
      );
      const averageEngagement = getSocialPublishingAnalyticsNumber(
        row.averageEngagement ?? row.avg_engagement,
      );
      const averageEngagementRate = getSocialPublishingAnalyticsNumber(
        row.averageEngagementRate ?? row.avg_engagement_rate,
      );
      const key = `${row.platform}:${postsPerWeek}`;
      const existing = rowsByFrequency.get(key) ?? {
        averageEngagement: 0,
        averageEngagementRate: 0,
        platform: row.platform,
        postsPerWeek,
        weightedEngagement: 0,
        weightedEngagementRate: 0,
        weeksCount: 0,
      };
      const weight = Math.max(1, weeksCount);

      existing.weeksCount += weeksCount;
      existing.weightedEngagement += averageEngagement * weight;
      existing.weightedEngagementRate += averageEngagementRate * weight;
      existing.averageEngagement =
        existing.weightedEngagement / Math.max(1, existing.weeksCount);
      existing.averageEngagementRate =
        existing.weightedEngagementRate / Math.max(1, existing.weeksCount);
      rowsByFrequency.set(key, existing);
    });
  });

  return [...rowsByFrequency.values()]
    .map((row) => ({
      averageEngagement: row.averageEngagement,
      averageEngagementRate: row.averageEngagementRate,
      platform: row.platform,
      postsPerWeek: row.postsPerWeek,
      weeksCount: row.weeksCount,
    }))
    .sort((a, b) => {
      const platformOrder = a.platform.localeCompare(b.platform);
      return platformOrder || a.postsPerWeek - b.postsPerWeek;
    });
}
