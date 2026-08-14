import { createSocialPublishingAnalyticsQuery } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingAnalyticsQuery";
import { getSocialPublishingAnalyticsNumber } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsNumber";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";
import type { SocialPublishingContentDecayBucket } from "@/lib/clipstitchr/types/SocialPublishingContentDecayBucket";

type ZernioContentDecayBucket = {
  avg_pct_of_final?: unknown;
  averagePercentOfFinal?: unknown;
  bucket_label?: unknown;
  bucket_order?: unknown;
  label?: unknown;
  order?: unknown;
  postCount?: unknown;
  post_count?: unknown;
};

type ZernioContentDecayResponse = {
  buckets?: ZernioContentDecayBucket[];
};

export async function loadSocialPublishingContentDecay(
  apiKey: string,
  scopes: SocialPublishingAnalyticsQueryScope[],
) {
  const responses = await Promise.all(
    scopes.map((scope) =>
      requestSocialPublishing<ZernioContentDecayResponse>(
        "/v1/analytics/content-decay",
        {
          apiKey,
          query: createSocialPublishingAnalyticsQuery(scope),
        },
      ),
    ),
  );
  const bucketsByOrder = new Map<
    number,
    SocialPublishingContentDecayBucket & { weightedPercent: number }
  >();

  responses.forEach((response) => {
    (response.buckets ?? []).forEach((row) => {
      const order = getSocialPublishingAnalyticsNumber(
        row.order ?? row.bucket_order,
      );
      const label =
        typeof (row.label ?? row.bucket_label) === "string"
          ? String(row.label ?? row.bucket_label)
          : "";

      if (!label) {
        return;
      }

      const postCount = getSocialPublishingAnalyticsNumber(
        row.postCount ?? row.post_count,
      );
      const averagePercentOfFinal = getSocialPublishingAnalyticsNumber(
        row.averagePercentOfFinal ?? row.avg_pct_of_final,
      );
      const existing = bucketsByOrder.get(order) ?? {
        averagePercentOfFinal: 0,
        label,
        order,
        postCount: 0,
        weightedPercent: 0,
      };
      const weight = Math.max(1, postCount);

      existing.postCount += postCount;
      existing.weightedPercent += averagePercentOfFinal * weight;
      existing.averagePercentOfFinal =
        existing.weightedPercent / Math.max(1, existing.postCount);
      bucketsByOrder.set(order, existing);
    });
  });

  return [...bucketsByOrder.values()]
    .map((bucket) => ({
      averagePercentOfFinal: bucket.averagePercentOfFinal,
      label: bucket.label,
      order: bucket.order,
      postCount: bucket.postCount,
    }))
    .sort((a, b) => a.order - b.order);
}
