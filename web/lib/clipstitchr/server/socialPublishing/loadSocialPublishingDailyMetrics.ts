import { createSocialPublishingAnalyticsQuery } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingAnalyticsQuery";
import { getSocialPublishingAnalyticsNumber } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsNumber";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";
import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";

type ZernioDailyMetric = {
  date?: unknown;
  metrics?: Record<string, unknown>;
  postCount?: unknown;
  post_count?: unknown;
};

type ZernioDailyMetricsResponse = {
  dailyData?: ZernioDailyMetric[];
  daily_data?: ZernioDailyMetric[];
};

export async function loadSocialPublishingDailyMetrics(
  apiKey: string,
  scopes: SocialPublishingAnalyticsQueryScope[],
) {
  const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const responses = await Promise.all(
    scopes.map((scope) =>
      requestSocialPublishing<ZernioDailyMetricsResponse>(
        "/v1/analytics/daily-metrics",
        {
          apiKey,
          query: createSocialPublishingAnalyticsQuery(scope, {
            attribution: "received",
            fromDate,
          }),
        },
      ),
    ),
  );
  const metricsByDate = new Map<string, SocialPublishingDailyMetric>();

  responses.forEach((response) => {
    (response.dailyData ?? response.daily_data ?? []).forEach((row) => {
      if (typeof row.date !== "string" || !row.date) {
        return;
      }

      const existing = metricsByDate.get(row.date);
      const metrics = row.metrics ?? {};
      const next: SocialPublishingDailyMetric = existing ?? {
        date: row.date,
        postCount: 0,
        metrics: {
          clicks: 0,
          comments: 0,
          impressions: 0,
          likes: 0,
          reach: 0,
          saves: 0,
          shares: 0,
          views: 0,
        },
      };

      next.postCount += getSocialPublishingAnalyticsNumber(
        row.postCount ?? row.post_count,
      );
      next.metrics.clicks += getSocialPublishingAnalyticsNumber(metrics.clicks);
      next.metrics.comments += getSocialPublishingAnalyticsNumber(metrics.comments);
      next.metrics.impressions += getSocialPublishingAnalyticsNumber(
        metrics.impressions,
      );
      next.metrics.likes += getSocialPublishingAnalyticsNumber(metrics.likes);
      next.metrics.reach += getSocialPublishingAnalyticsNumber(metrics.reach);
      next.metrics.saves += getSocialPublishingAnalyticsNumber(metrics.saves);
      next.metrics.shares += getSocialPublishingAnalyticsNumber(metrics.shares);
      next.metrics.views += getSocialPublishingAnalyticsNumber(metrics.views);
      metricsByDate.set(row.date, next);
    });
  });

  return [...metricsByDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
