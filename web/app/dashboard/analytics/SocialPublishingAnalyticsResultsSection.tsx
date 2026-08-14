import { SocialPublishingAnalyticsResultRow } from "@/app/dashboard/analytics/SocialPublishingAnalyticsResultRow";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

type SocialPublishingAnalyticsResultsSectionProps = {
  analytics: SocialPublishingAnalytics[];
};

export function SocialPublishingAnalyticsResultsSection({
  analytics,
}: SocialPublishingAnalyticsResultsSectionProps) {
  return (
    <section className="rounded-lg bg-surface">
      <div className="p-5 sm:p-6">
        <h2 className="text-xl font-bold text-text-primary">Post results</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Includes posts made in ClipStitchr and posts published directly on each connected channel.
        </p>
      </div>
      <div className="divide-y divide-border">
        {analytics.length ? (
          analytics.map((item) => (
            <SocialPublishingAnalyticsResultRow key={item.id} item={item} />
          ))
        ) : (
          <p className="px-5 pb-6 text-sm font-semibold text-text-secondary">
            No post results in this time range.
          </p>
        )}
      </div>
    </section>
  );
}
