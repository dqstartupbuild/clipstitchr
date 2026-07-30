import type { SocialAnalyticsMetricName } from "./SocialAnalyticsMetricName";
import { sumSocialAnalyticsMetricValues } from "./sumSocialAnalyticsMetricValues";

export function createSocialAnalyticsRollups(
  publications: Array<{
    groupId: string;
    groupLabel: string;
    metrics: Record<SocialAnalyticsMetricName, number | null>;
  }>,
) {
  const groups = new Map<
    string,
    {
      id: string;
      label: string;
      metrics: Array<Record<SocialAnalyticsMetricName, number | null>>;
    }
  >();

  for (const publication of publications) {
    const group = groups.get(publication.groupId) ?? {
      id: publication.groupId,
      label: publication.groupLabel,
      metrics: [],
    };
    group.metrics.push(publication.metrics);
    groups.set(publication.groupId, group);
  }

  return Array.from(groups.values()).map((group) => ({
    id: group.id,
    label: group.label,
    publicationCount: group.metrics.length,
    metrics: sumSocialAnalyticsMetricValues(group.metrics),
  }));
}
