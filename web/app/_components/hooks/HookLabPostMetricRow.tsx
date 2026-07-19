import type { HookLabPostMetrics } from "@/lib/clipstitchr/types/HookLabPostMetrics";
import { formatHookLabMetric } from "@/lib/clipstitchr/utils/formatHookLabMetric";

export function HookLabPostMetricRow({
  metrics,
}: {
  metrics: HookLabPostMetrics;
}) {
  const items = [
    ["Plays", metrics.playCount],
    ["Likes", metrics.likeCount],
    ["Comments", metrics.commentCount],
    ["Shares", metrics.shareCount],
    ["Saves", metrics.saveCount],
  ] as const;

  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium text-text-tertiary">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-text-primary">
            {formatHookLabMetric(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
