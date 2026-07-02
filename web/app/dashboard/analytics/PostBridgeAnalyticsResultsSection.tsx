import { PostBridgeAnalyticsResultRow } from "@/app/dashboard/analytics/PostBridgeAnalyticsResultRow";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";

type PostBridgeAnalyticsResultsSectionProps = {
  analytics: ContentAnalytics[];
};

export function PostBridgeAnalyticsResultsSection({
  analytics,
}: PostBridgeAnalyticsResultsSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-white">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-bold text-text-primary">Results</h2>
      </div>
      <div className="divide-y divide-border">
        {analytics.length ? (
          analytics.map((item) => (
            <PostBridgeAnalyticsResultRow key={item.id} item={item} />
          ))
        ) : (
          <p className="p-4 text-sm font-semibold text-text-secondary">
            No post results in this view.
          </p>
        )}
      </div>
    </section>
  );
}
