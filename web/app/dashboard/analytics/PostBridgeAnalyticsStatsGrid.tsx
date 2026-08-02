import { PostBridgeAnalyticsStatCard } from "@/app/dashboard/analytics/PostBridgeAnalyticsStatCard";
import type { PostBridgeAnalyticsTotals } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals";

type PostBridgeAnalyticsStatsGridProps = {
  totals: PostBridgeAnalyticsTotals;
};

export function PostBridgeAnalyticsStatsGrid({
  totals,
}: PostBridgeAnalyticsStatsGridProps) {
  const stats = [
    { label: "Views", value: totals.views },
    { label: "Likes", value: totals.likes },
    { label: "Comments", value: totals.comments },
    { label: "Shares", value: totals.shares },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <PostBridgeAnalyticsStatCard
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
}
