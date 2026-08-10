import { SocialPublishingAnalyticsResultRow } from "@/app/dashboard/analytics/SocialPublishingAnalyticsResultRow";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

type SocialPublishingAnalyticsResultsSectionProps = {
  analytics: SocialPublishingAnalytics[];
};

export function SocialPublishingAnalyticsResultsSection({
  analytics,
}: SocialPublishingAnalyticsResultsSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-white">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-bold text-text-primary">Results</h2>
      </div>
      <div className="divide-y divide-border">
        {analytics.length ? (
          analytics.map((item) => (
            <SocialPublishingAnalyticsResultRow key={item.id} item={item} />
          ))
        ) : (
          <p className="p-4 text-sm font-semibold text-text-secondary">
            No post results in this time range.
          </p>
        )}
      </div>
    </section>
  );
}
