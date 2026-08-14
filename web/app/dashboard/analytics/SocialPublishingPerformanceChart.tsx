import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import { createSocialPublishingPerformanceChartSeries } from "@/lib/clipstitchr/utils/createSocialPublishingPerformanceChartSeries";
import { formatSocialPublishingChartDate } from "@/lib/clipstitchr/utils/formatSocialPublishingChartDate";
import { formatSocialPublishingNumber } from "@/lib/clipstitchr/utils/formatSocialPublishingNumber";

type SocialPublishingPerformanceChartProps = {
  dailyMetrics: SocialPublishingDailyMetric[];
};

export function SocialPublishingPerformanceChart({
  dailyMetrics,
}: SocialPublishingPerformanceChartProps) {
  const series = createSocialPublishingPerformanceChartSeries(dailyMetrics);

  return (
    <section className="rounded-lg bg-surface p-5 sm:p-6" aria-labelledby="performance-over-time">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="performance-over-time" className="text-xl font-bold text-text-primary">
            Performance over time
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            When views and interactions arrived, including older posts still gaining attention.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-4 text-xs font-semibold text-text-secondary"
          role="group"
          aria-label="Chart legend"
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-5 rounded-full bg-accent-dark" />
            Views
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-5 rounded-full bg-success" />
            Interactions
          </span>
        </div>
      </div>

      {series ? (
        <div className="mt-6">
          <svg
            aria-label={`Views and interactions from ${formatSocialPublishingChartDate(series.firstDate)} to ${formatSocialPublishingChartDate(series.lastDate)}. Peak daily value ${formatSocialPublishingNumber(series.maxValue)}.`}
            className="h-auto w-full overflow-visible"
            role="img"
            viewBox="0 0 720 220"
          >
            <line x1="24" x2="696" y1="172" y2="172" stroke="currentColor" className="text-border" strokeLinecap="round" />
            <polyline
              fill="none"
              points={series.viewPoints}
              stroke="var(--accent-dark)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              fill="none"
              points={series.engagementPoints}
              stroke="var(--success)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
            <text x="24" y="208" fill="currentColor" className="text-[12px] text-text-tertiary">
              {formatSocialPublishingChartDate(series.firstDate)}
            </text>
            <text x="696" y="208" textAnchor="end" fill="currentColor" className="text-[12px] text-text-tertiary">
              {formatSocialPublishingChartDate(series.lastDate)}
            </text>
          </svg>
        </div>
      ) : (
        <p className="mt-6 text-sm font-semibold text-text-tertiary">
          A daily trend will appear after Zernio has enough history.
        </p>
      )}
    </section>
  );
}
