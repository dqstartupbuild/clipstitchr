import type { SocialAnalyticsSnapshot } from "../SocialAnalyticsSnapshot";
import { createInstagramOfficialAnalyticsSnapshot } from "./createInstagramOfficialAnalyticsSnapshot";
import { fetchInstagramInsightMetric } from "./fetchInstagramInsightMetric";
import { fetchInstagramMediaMetadata } from "./fetchInstagramMediaMetadata";
import { getInstagramInsightMetricNames } from "./getInstagramInsightMetricNames";

export async function loadInstagramAnalyticsSnapshot(
  mediaId: string,
  accessToken: string,
): Promise<SocialAnalyticsSnapshot> {
  const metadata = await fetchInstagramMediaMetadata(mediaId, accessToken);
  const metricNames = getInstagramInsightMetricNames(metadata);
  const results = await Promise.allSettled(
    metricNames.map(async (metric) => ({
      metric,
      value: await fetchInstagramInsightMetric(
        mediaId,
        metric,
        accessToken,
      ),
    })),
  );
  const metrics: Record<string, number | null> = {};
  const unavailableMetrics: string[] = [];

  for (const [index, result] of results.entries()) {
    const metric = metricNames[index];

    if (result.status === "fulfilled") {
      metrics[result.value.metric] = result.value.value;
    } else {
      metrics[metric] = null;
      unavailableMetrics.push(metric);
    }
  }

  return createInstagramOfficialAnalyticsSnapshot({
    metadata,
    metrics,
    unavailableMetrics,
  });
}
