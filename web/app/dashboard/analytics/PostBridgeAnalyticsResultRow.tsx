import { Badge } from "@/app/_components/ui/Badge";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsCreatedAtLabel } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtLabel";
import { getPostBridgePlatformLabel } from "@/lib/clipstitchr/utils/getPostBridgePlatformLabel";
import { getPostBridgeScheduledAtLabel } from "@/lib/clipstitchr/utils/getPostBridgeScheduledAtLabel";
import { getPostBridgeUnknownString } from "@/lib/clipstitchr/utils/getPostBridgeUnknownString";
import { PostBridgeAnalyticsMetricCell } from "@/app/dashboard/analytics/PostBridgeAnalyticsMetricCell";

type PostBridgeAnalyticsResultRowProps = {
  item: PostBridgeAnalytics;
};

export function PostBridgeAnalyticsResultRow({
  item,
}: PostBridgeAnalyticsResultRowProps) {
  const shareUrl = getPostBridgeUnknownString(item.share_url);
  const metrics = [
    { label: "Views", value: item.view_count },
    { label: "Likes", value: item.like_count },
    { label: "Comments", value: item.comment_count },
    { label: "Shares", value: item.share_count },
  ];

  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{getPostBridgePlatformLabel(item.platform)}</Badge>
          <span className="text-xs font-semibold text-text-tertiary">
            {getPostBridgeAnalyticsCreatedAtLabel(item)}
          </span>
          <span className="text-xs font-semibold text-text-tertiary">
            Synced {getPostBridgeScheduledAtLabel(item.last_synced_at)}
          </span>
        </div>
        <p className="mt-2 truncate text-sm font-bold text-text-primary">
          {getPostBridgeUnknownString(item.video_description) ||
            item.post_result_id}
        </p>
        {shareUrl ? (
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Open post
          </a>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-3 text-right">
        {metrics.map((metric) => (
          <PostBridgeAnalyticsMetricCell
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </div>
  );
}
