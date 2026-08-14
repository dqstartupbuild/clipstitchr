import { createSocialPublishingAnalyticsQuery } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingAnalyticsQuery";
import { getSocialPublishingAnalyticsNumber } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsNumber";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";
import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";

type ZernioBestTimeSlot = {
  avg_engagement?: unknown;
  averageEngagement?: unknown;
  dayOfWeek?: unknown;
  day_of_week?: unknown;
  hour?: unknown;
  postCount?: unknown;
  post_count?: unknown;
};

type ZernioBestTimesResponse = {
  slots?: ZernioBestTimeSlot[];
};

export async function loadSocialPublishingBestTimes(
  apiKey: string,
  scopes: SocialPublishingAnalyticsQueryScope[],
) {
  const responses = await Promise.all(
    scopes.map((scope) =>
      requestSocialPublishing<ZernioBestTimesResponse>(
        "/v1/analytics/best-time",
        {
          apiKey,
          query: createSocialPublishingAnalyticsQuery(scope),
        },
      ),
    ),
  );
  const slotsByTime = new Map<
    string,
    SocialPublishingBestTimeSlot & { weightedEngagement: number }
  >();

  responses.forEach((response) => {
    (response.slots ?? []).forEach((row) => {
      const dayOfWeek = getSocialPublishingAnalyticsNumber(
        row.dayOfWeek ?? row.day_of_week,
      );
      const hour = getSocialPublishingAnalyticsNumber(row.hour);
      const postCount = getSocialPublishingAnalyticsNumber(
        row.postCount ?? row.post_count,
      );
      const averageEngagement = getSocialPublishingAnalyticsNumber(
        row.averageEngagement ?? row.avg_engagement,
      );

      if (dayOfWeek < 0 || dayOfWeek > 6 || hour < 0 || hour > 23) {
        return;
      }

      const key = `${dayOfWeek}:${hour}`;
      const existing = slotsByTime.get(key) ?? {
        averageEngagement: 0,
        dayOfWeek,
        hour,
        postCount: 0,
        weightedEngagement: 0,
      };
      const weight = Math.max(1, postCount);

      existing.postCount += postCount;
      existing.weightedEngagement += averageEngagement * weight;
      existing.averageEngagement =
        existing.weightedEngagement / Math.max(1, existing.postCount);
      slotsByTime.set(key, existing);
    });
  });

  return [...slotsByTime.values()]
    .map((slot) => ({
      averageEngagement: slot.averageEngagement,
      dayOfWeek: slot.dayOfWeek,
      hour: slot.hour,
      postCount: slot.postCount,
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement);
}
