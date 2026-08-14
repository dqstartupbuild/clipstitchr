import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { getSocialPublishingAnalyticsCreatedAtLabel } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsCreatedAtLabel";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";
import { getSocialPublishingScheduledAtLabel } from "@/lib/clipstitchr/utils/getSocialPublishingScheduledAtLabel";
import { SocialPublishingAnalyticsMetricCell } from "@/app/dashboard/analytics/SocialPublishingAnalyticsMetricCell";

type SocialPublishingAnalyticsResultRowProps = {
  item: SocialPublishingAnalytics;
};

export function SocialPublishingAnalyticsResultRow({
  item,
}: SocialPublishingAnalyticsResultRowProps) {
  const metrics = [
    { label: "Views", value: item.view_count },
    { label: "Reach", value: item.reach_count },
    { label: "Impressions", value: item.impression_count },
    { label: "Likes", value: item.like_count },
    { label: "Comments", value: item.comment_count },
    { label: "Shares", value: item.share_count },
    { label: "Saves", value: item.save_count },
    { label: "Clicks", value: item.click_count },
  ];

  return (
    <article className="grid gap-5 p-5 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(32rem,1.2fr)] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-bold text-accent-dark">
            {getSocialPublishingPlatformLabel(item.platform)}
          </span>
          {item.account_username ? (
            <span className="text-xs font-semibold text-text-tertiary">
              {item.account_username}
            </span>
          ) : null}
          <span className="text-xs font-semibold text-text-tertiary">
            {item.is_external ? "Published on channel" : "Published with ClipStitchr"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-text-tertiary">
            {getSocialPublishingAnalyticsCreatedAtLabel(item)}
          </span>
          <span className="text-xs font-semibold text-text-tertiary">
            Synced {getSocialPublishingScheduledAtLabel(item.last_synced_at)}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-text-primary">
          {item.video_description || item.post_result_id}
        </p>
        {item.share_url ? (
          <a
            href={item.share_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-sm font-semibold text-accent-dark transition-colors hover:text-text-primary"
          >
            Open post
          </a>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-left sm:grid-cols-4 sm:text-right">
        {metrics.map((metric) => (
          <SocialPublishingAnalyticsMetricCell
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </article>
  );
}
