import { SocialPublishingAnalyticsStatCard } from "@/app/dashboard/analytics/SocialPublishingAnalyticsStatCard";
import type { SocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";

type SocialPublishingAnalyticsStatsGridProps = {
  totals: SocialPublishingAnalyticsTotals;
};

export function SocialPublishingAnalyticsStatsGrid({
  totals,
}: SocialPublishingAnalyticsStatsGridProps) {
  const stats = [
    { label: "Views", value: totals.views },
    { label: "Reach", value: totals.reach },
    { label: "Impressions", value: totals.impressions },
    { label: "Average engagement", value: `${totals.averageEngagementRate.toFixed(1)}%` },
    { label: "Saves", value: totals.saves },
    { label: "Link clicks", value: totals.clicks },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => (
        <SocialPublishingAnalyticsStatCard
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
}
