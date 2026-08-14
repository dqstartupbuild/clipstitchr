import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import type { SocialPublishingPerformanceChartSeries } from "@/lib/clipstitchr/types/SocialPublishingPerformanceChartSeries";

export function createSocialPublishingPerformanceChartSeries(
  dailyMetrics: SocialPublishingDailyMetric[],
): SocialPublishingPerformanceChartSeries | null {
  if (!dailyMetrics.length) {
    return null;
  }

  const values = dailyMetrics.flatMap((row) => [
    row.metrics.views,
    row.metrics.likes +
      row.metrics.comments +
      row.metrics.shares +
      row.metrics.saves +
      row.metrics.clicks,
  ]);
  const maxValue = Math.max(1, ...values);
  const width = 672;
  const height = 152;
  const denominator = Math.max(1, dailyMetrics.length - 1);
  const createPoints = (selector: (row: SocialPublishingDailyMetric) => number) =>
    dailyMetrics
      .map((row, index) => {
        const x = 24 + (index / denominator) * width;
        const y = 20 + height - (selector(row) / maxValue) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return {
    engagementPoints: createPoints(
      (row) =>
        row.metrics.likes +
        row.metrics.comments +
        row.metrics.shares +
        row.metrics.saves +
        row.metrics.clicks,
    ),
    firstDate: dailyMetrics[0].date,
    lastDate: dailyMetrics[dailyMetrics.length - 1].date,
    maxValue,
    viewPoints: createPoints((row) => row.metrics.views),
  };
}
