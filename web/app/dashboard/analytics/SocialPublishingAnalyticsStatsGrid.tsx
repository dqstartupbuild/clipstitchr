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
    { label: "Likes", value: totals.likes },
    { label: "Comments", value: totals.comments },
    { label: "Shares", value: totals.shares },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
