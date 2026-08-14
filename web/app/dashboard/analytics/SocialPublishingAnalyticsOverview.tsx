import { SocialPublishingAnalyticsStatsGrid } from "@/app/dashboard/analytics/SocialPublishingAnalyticsStatsGrid";
import { SocialPublishingPerformanceChart } from "@/app/dashboard/analytics/SocialPublishingPerformanceChart";
import { SocialPublishingPlatformPerformance } from "@/app/dashboard/analytics/SocialPublishingPlatformPerformance";
import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import type { SocialPublishingPlatformAnalyticsSummary } from "@/lib/clipstitchr/types/SocialPublishingPlatformAnalyticsSummary";
import type { SocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";

type SocialPublishingAnalyticsOverviewProps = {
  dailyMetrics: SocialPublishingDailyMetric[];
  platformSummaries: SocialPublishingPlatformAnalyticsSummary[];
  totals: SocialPublishingAnalyticsTotals;
};

export function SocialPublishingAnalyticsOverview({
  dailyMetrics,
  platformSummaries,
  totals,
}: SocialPublishingAnalyticsOverviewProps) {
  return (
    <div className="grid min-w-0 gap-5">
      <SocialPublishingAnalyticsStatsGrid totals={totals} />
      <SocialPublishingPerformanceChart dailyMetrics={dailyMetrics} />
      <SocialPublishingPlatformPerformance summaries={platformSummaries} />
    </div>
  );
}
